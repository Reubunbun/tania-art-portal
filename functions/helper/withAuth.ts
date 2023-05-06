import { type Handler, type HandlerEvent, type HandlerResponse } from '@netlify/functions';
import { Client as PgClient } from 'pg';
import { verify as verifyToken } from 'jsonwebtoken';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';
import { type JWTObject, COOKIE_NAME } from '../../shared/Constants';

export default function withAuth(
    handler: (pgClient: PgClient, handlerEvent: HandlerEvent) => Promise<HandlerResponse>,
) : Handler {
    return async(handlerEvent: HandlerEvent) => {
        const parsedCookie = parseCookie(handlerEvent.headers.cookie || '');
        const cookieValue = parsedCookie[COOKIE_NAME];
        if (!cookieValue) {
            return { statusCode: 401 };
        }

        let passed = true;
        try {
            const decodedToken = verifyToken(cookieValue, process.env.JWT_SECRET!) as JWTObject;
            if (decodedToken.Token !== process.env.TOKEN) {
                passed = false;
            }
        } catch (err) {
            passed = false;
        }

        if (!passed) {
            return {
                statusCode: 401,
                headers: {
                    'Set-Cookie': serializeCookie(
                        COOKIE_NAME,
                        '',
                        {
                            path: '/',
                            maxAge: 0,
                        }
                    ),
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({message: 'Unauthorized'})
            };
        }

        const pgClient = new PgClient({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASS,
            port: Number(process.env.DB_PORT),
            ssl: {rejectUnauthorized: false },
        });

        await pgClient.connect();

        return handler(pgClient, handlerEvent)
            .catch(err => {
                return {
                    statusCode: 500,
                    body: err.message,
                };
            })
            .finally(() => pgClient.end());
    };
}

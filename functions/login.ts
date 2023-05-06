import { type Handler } from '@netlify/functions';
import { serialize as serializeCookie } from 'cookie';
import { sign as signToken } from 'jsonwebtoken';
import { COOKIE_NAME, JWTObject } from '../shared/Constants';

const handler: Handler = async ({ httpMethod, body }) => {
    if (httpMethod !== 'POST') {
        return {
            statusCode: 410,
            body: JSON.stringify({message: 'Invalid request method'}),
        };
    }

    if (!body) {
        return { statusCode: 401, body: JSON.stringify({message: 'Missing body'}) };
    }

    const {Password: strPassword} = JSON.parse(body);
    if (strPassword !== process.env.TOKEN) {
        return {
            statusCode: 401,
            body: JSON.stringify({method: 'Incorrect password'}),
        };
    }

    const intMsInAnHour = 3600000;
    const intMsInTwoWeeks = 14 * 24 * intMsInAnHour;
    const strCookie = serializeCookie(
        COOKIE_NAME,
        signToken(
            { Token: strPassword } as JWTObject,
            process.env.JWT_SECRET!,
        ),
        {
            path: '/',
            maxAge: intMsInTwoWeeks,
        },
    );

    return {
        statusCode: 200,
        headers: {
            'Set-Cookie': strCookie,
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({message: 'Logged In'}),
    };
};

export { handler };

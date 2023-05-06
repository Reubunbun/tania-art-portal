const { Client } = require('pg');
const auth = require('./service/auth.js');
const DaoCommSpaces = require('./dao/CommSpaces.js');

module.exports.handler = async function(objRequest) {
    const {Status, Response} = await auth(objRequest);

    if (Status === auth.STATUS_FAILED) {
        return Response;
    }

    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: 5432,
        ssl: {rejectUnauthorized: false },
    });
    await client.connect();

    const daoCommSpaces = new DaoCommSpaces(client);

    try {
        switch (objRequest.httpMethod) {
            case 'GET': {
                let intSpaces;
                try {
                    intSpaces = await daoCommSpaces.getSpaces();
                } catch (e) {
                    console.log(e);
                    throw e;
                }
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        Spaces: intSpaces,
                    }),
                };
            }
            case 'PUT': {
                const {Spaces: intSpaces} = JSON.parse(objRequest.body);
                await daoCommSpaces.updateSpaces(intSpaces);
                return {
                    statusCode: 200,
                    body: JSON.stringify({message: 'Updated'}),
                };
            }
            default:
                return {
                    statusCode: 410,
                    body: JSON.stringify({method: 'Invalid request method'}),
                };
        }
    } catch (err) {
    } finally {
        await client.end();
    }
}

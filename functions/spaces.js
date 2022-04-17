const sql = require('mysql');
const auth = require('./service/auth.js');
const DaoCommSpaces = require('./dao/CommSpaces.js');

module.exports.handler = async function(objRequest) {
    const {Status, Response} = await auth(objRequest);

    if (Status === auth.STATUS_FAILED) {
        return Response;
    }

    const connSQL = sql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });
    const daoCommSpaces = new DaoCommSpaces(connSQL);

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
        connSQL.destroy();
    }
}

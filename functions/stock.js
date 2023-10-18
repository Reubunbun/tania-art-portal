const { Client } = require('pg');
const auth = require('./service/auth.js');
const DaoProducts = require('./dao/Products.js');

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

    const daoProducts = new DaoProducts(client);

    try {
        switch (objRequest.httpMethod) {
            case 'GET': {
                let products;
                try {
                    products = await daoProducts.getAll();
                } catch (e) {
                    console.log(e);
                    throw e;
                }
                return {
                    statusCode: 200,
                    body: JSON.stringify(products),
                };
            }
            case 'PUT': {
                const intProductId = objRequest.path.split('/').pop();
                const { Stock: intStock } = JSON.parse(objRequest.body);
                await daoProducts.updateStockByProductId(intProductId, intStock);
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
        console.log(err);
    } finally {
        await client.end();
    }
};

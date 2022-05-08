const sql = require('mysql');
const auth = require('./service/auth.js');
const DaoCommTypes = require('./dao/CommTypes.js');

module.exports.handler = async function (objRequest) {
    const { Status, Response } = await auth(objRequest);
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

    const {type} = objRequest.queryStringParameters;
    const daoCommTypes = new DaoCommTypes(connSQL, type);

    try {
        switch (objRequest.httpMethod) {
            case 'GET': {
                return await getAll(objRequest, daoCommTypes);
            }
            case 'POST': {
                return await create(objRequest, daoCommTypes);
            }
            case 'PUT': {
                const strDisplay = objRequest.path.split('/').pop().split('?').shift();
                return await update(objRequest, strDisplay, daoCommTypes);
            }
            case 'DELETE': {
                const strDisplay = objRequest.path.split('/').pop().split('?').shift();
                return await deleteComm(objRequest, strDisplay, daoCommTypes);
            }
            default: {
                return {
                    statusCode: 405,
                    body: JSON.stringify({method: 'Invalid request method'}),
                };
            }
        }
    } catch (err) {
        console.log(err);
    } finally {
        connSQL.destroy();
    }
};

async function getAll(objRequest, daoCommTypes) {
    const results = await daoCommTypes.getAll();
    return {
        statusCode: 200,
        body: JSON.stringify(results),
    };
}

async function create(objRequest, daoCommTypes) {
    console.log(objRequest.body);
    const {
        Display: strDisplay,
        Price: intPrice,
        Offer: intOffer,
        ExampleURL: strExampleUrl,
    } = JSON.parse(objRequest.body);

    console.log(strDisplay, intPrice, intOffer, strExampleUrl);
    await daoCommTypes.create(strDisplay, intPrice, intOffer, strExampleUrl);

    return {
        statusCode: 200,
        body: JSON.stringify({message: 'Created Successfully'}),
    };
}

async function update(objRequest, strDisplay, daoCommTypes) {
    const {
        Display: strNewDisplay,
        Price: intPrice,
        Offer: intOffer,
        ExampleURL: strExampleUrl,
    } = JSON.parse(objRequest.body);

    await daoCommTypes.update(
        decodeURIComponent(strDisplay),
        strNewDisplay && decodeURIComponent(strNewDisplay),
        intPrice,
        intOffer,
        strExampleUrl,
    );

    return {
        statusCode: 200,
        body: JSON.stringify({message: 'Updated Successfully'}),
    };
}

async function deleteComm(objRequest, strDisplay, daoCommTypes) {
    await daoCommTypes.delete(decodeURIComponent(strDisplay));

    return {
        statusCode: 200,
        body: JSON.stringify({message: 'Deleted Successfully'}),
    };
}

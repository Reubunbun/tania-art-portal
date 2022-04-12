const sql = require('mysql');
const auth = require('./service/auth.js');
const DaoPortfolioImages = require('./dao/PortfolioImages.js');

module.exports.handler = async function(objRequest) {
    const {Status, Response} = auth(objRequest);

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
    const daoPortfolioImages = new DaoPortfolioImages(connSQL);

    try {
        switch (objRequest.httpMethod) {
            case 'GET': {
                return await getAll(objRequest, daoPortfolioImages);
            }
            case 'POST': {
                return await create(objRequest, daoPortfolioImages);
            }
            case 'PUT': {
                const intImageId = objRequest.path.split('/').pop();
                return await update(objRequest, daoPortfolioImages, intImageId);
            }
            case 'DELETE': {
                const intImageId = objRequest.path.split('/').pop();
                return await deleteId(objRequest, daoPortfolioImages, intImageId);
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
};

async function create(objRequest, daoPortfolioImages) {
    const {
        Title: strTitle,
        Description: strDescription,
        Tags: strTags,
        URL: strImageUrl,
    } = JSON.parse(objRequest.body);

    const arrTags = strTags ? strTags.split(', ') : null;

    let objResult;
    try {
         objResult = await daoPortfolioImages.createNEW(
            strTitle,
            strDescription,
            arrTags,
            strImageUrl,
        );
    } catch (e) {
        console.log(e);
        throw e;
    }

    return {
        statusCode: 200,
        body: JSON.stringify(objResult),
    };
}

async function getAll(objRequest, daoPortfolioImages) {
    const intPage = objRequest.queryStringParameters.page || 0;

    const objTagFlags = await daoPortfolioImages.getTags();
    const objResult = await daoPortfolioImages.getAll(intPage, objTagFlags);

    return {
        statusCode: 200,
        body: JSON.stringify(objResult),
    };
}

async function update(objRequest, daoPortfolioImages, intImageId) {
    const {
        Prio: intPrio,
        Title: strTitle,
        Description: strDescription,
        Tags: strTags,
    } = JSON.parse(objRequest.body);

    const arrTags = strTags === undefined ? null : strTags.split(', ');
    try {
        await daoPortfolioImages.updateNEW(
            intImageId,
            intPrio,
            strTitle,
            strDescription,
            arrTags,
        );
    } catch (err) {
        console.log(err);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({message: 'Updated'}),
    };
}

async function deleteId(objRequest, daoPortfolioImages, intImageId) {
    await daoPortfolioImages.deleteNEW(intImageId);

    return {
        statusCode: 200,
        body: JSON.stringify({message: 'Deleted'}),
    };
}

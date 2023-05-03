const { Client } = require('pg');
const auth = require('./service/auth.js');
const DaoPortfolioImages = require('./dao/PortfolioImages.js');
const DaoPortfolioTags = require('./dao/PortfolioTags.js');

module.exports.handler = async function(objRequest) {
    const {Status, Response} = await auth(objRequest);
    console.log('finished auth');
    console.log('status: ', Status);

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
    const daoPortfolioImages = new DaoPortfolioImages(client);
    const daoPortfolioTags = new DaoPortfolioTags(client);

    try {
        switch (objRequest.httpMethod) {
            case 'GET': {
                return await getAll(objRequest, daoPortfolioImages);
            }
            case 'POST': {
                return await create(
                    objRequest,
                    daoPortfolioImages,
                    daoPortfolioTags,
                );
            }
            case 'PUT': {
                const intImageId = objRequest.path.split('/').pop();
                return await update(
                    objRequest,
                    intImageId,
                    daoPortfolioImages,
                    daoPortfolioTags,
                );
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
        await client.end();
    }
};

async function create(objRequest, daoPortfolioImages, daoPortfolioTags) {
    const {
        Title: strTitle,
        Description: strDescription,
        Tags: strTags,
        URL: strImageUrl,
        Width: intWidth,
        Height: intHeight,
    } = JSON.parse(objRequest.body);

    const arrTags = strTags ? strTags.split(', ') : null;

    let objResult;
    try {
        objResult = await daoPortfolioImages.create(
            strTitle,
            strDescription,
            strImageUrl,
            intWidth,
            intHeight,
        );
    } catch (e) {
        console.log(e);
        throw e;
    }

    if (arrTags) {
        try {
            await daoPortfolioTags.createTags(objResult.Id, arrTags);
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(objResult),
    };
}

async function getAll(objRequest, daoPortfolioImages) {
    let objResult;
    try {
        objResult = await daoPortfolioImages.getAll();
    } catch (e) {
        console.log(e);
        throw e;
    }

    return {
        statusCode: 200,
        body: JSON.stringify(objResult),
    };
}

async function update(objRequest, intImageId, daoPortfolioImages, daoPortfolioTags) {
    const {
        Prio: intPrio,
        Title: strTitle,
        Description: strDescription,
        Tags: strTags,
    } = JSON.parse(objRequest.body);

    const arrTags = strTags === undefined ? null : strTags.split(', ');
    try {
        await daoPortfolioImages.update(
            intImageId,
            intPrio,
            strTitle,
            strDescription,
        );
    } catch (err) {
        console.log(err);
    }

    if (arrTags) {
        try {
            await daoPortfolioTags.updateTags(intImageId, arrTags);
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({message: 'Updated'}),
    };
}

async function deleteId(objRequest, daoPortfolioImages, intImageId) {
    await daoPortfolioImages.delete(intImageId);

    return {
        statusCode: 200,
        body: JSON.stringify({message: 'Deleted'}),
    };
}

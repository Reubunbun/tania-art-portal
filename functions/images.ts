import withAuth from './helper/withAuth';
import DaoPortfolioImages from './dao/PortfolioImages';
import DaoPortfolioTags from './dao/PortfolioTags';

const handler = withAuth(async (pgClient, handlerEvent) => {
    const daoPortfolioImages = new DaoPortfolioImages(pgClient);
    const daoPortfolioTags = new DaoPortfolioTags(pgClient);

    switch (handlerEvent.httpMethod) {
        case 'GET': {
            const result = await daoPortfolioImages.getAll();
            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        }
        case 'POST': {
            if (!handlerEvent.body) {
                return { statusCode: 400, body: JSON.stringify({ message: 'missing body' }) };
            }

            const { Title, Description, Tags, URL, Width, Height } = JSON.parse(handlerEvent.body);

            const imgResult = await daoPortfolioImages.create(
                Title,
                Description,
                URL,
                Width,
                Height,
            );

            const tagsAsArray = Tags && Tags.split(', ');
            if (tagsAsArray) {
                await daoPortfolioTags.createTags(imgResult.Id, tagsAsArray);
            }

            return {
                statusCode: 200,
                body: JSON.stringify(imgResult),
            };
        }
        case 'PUT': {
            const imgId = handlerEvent.path.split('/').pop();
            if (!imgId || Number.isNaN(Number(imgId))) {
                return { statusCode: 400, body: JSON.stringify({ message: 'missing or invalid img id' }) };
            }

            if (!handlerEvent.body) {
                return { statusCode: 400, body: JSON.stringify({ message: 'missing body' }) };
            }

            const { Prio, Title, Description, Tags } = JSON.parse(handlerEvent.body);
            await daoPortfolioImages.update(
                Number(imgId),
                Prio,
                Title,
                Description,
            );

            const tagsAsArray = Tags && Tags.split(', ');
            await daoPortfolioTags.updateTags(Number(imgId), tagsAsArray);

            return {
                statusCode: 200,
                body: JSON.stringify({message: 'Updated'}),
            };
        }
        case 'DELETE': {
            const imgId = handlerEvent.path.split('/').pop();
            if (!imgId || Number.isNaN(Number(imgId))) {
                return { statusCode: 400, body: JSON.stringify({ message: 'missing or invalid img id' }) };
            }

            await daoPortfolioImages.delete(Number(imgId));
            return {
                statusCode: 200,
                body: JSON.stringify({message: 'Deleted'}),
            };
        }
        default:
            return {
                statusCode: 410,
                body: JSON.stringify({method: 'Invalid request method'}),
            };
    }
});

export { handler };

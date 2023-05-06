import withAuth from './helper/withAuth';
import DaoCommissionSpaces from './dao/CommSpaces';

const handler = withAuth(async (pgClient, handlerEvent) => {
    const daoCommSpaces = new DaoCommissionSpaces(pgClient);

    switch (handlerEvent.httpMethod) {
        case 'GET': {
            const spaces = await daoCommSpaces.getSpaces();
            return {
                statusCode: 200,
                body: JSON.stringify({ Spaces: spaces }),
            };
        }
        case 'PUT': {
            if (!handlerEvent.body) {
                return { statusCode: 400, body: JSON.stringify({ message: 'missing body' }) };
            }

            const { Spaces } = JSON.parse(handlerEvent.body);
            if (!Spaces) {
                return { statusCode: 400, body: JSON.stringify({ message: 'missing Spaces' }) };
            }

            await daoCommSpaces.updateSpaces(Spaces);

            return {
                statusCode: 200,
                body: JSON.stringify({message: 'Updated'}),
            };
        }
        default:
            return { statusCode: 410, body: JSON.stringify({method: 'Invalid request method'}) };
    }
});

export { handler };

import withAuth from './helper/withAuth';
import DaoCommissionTypes from './dao/CommTypes';
import { COMM_TYPE_BASE, COMM_TYPE_BG, type CommissionOption } from '../shared/Constants';

const handler = withAuth(async (pgClient, handlerEvent) => {
    const params = handlerEvent.queryStringParameters;
    if (!params) {
        return { statusCode: 400, body: JSON.stringify({ message: 'missing type' }) };
    }

    const { type } = params;

    if (!type || (type !== COMM_TYPE_BASE && type !== COMM_TYPE_BG)) {
        return { statusCode: 400, body: JSON.stringify({ message: 'invalid type' }) };
    }

    const daoCommTypes = new DaoCommissionTypes(pgClient, type);

    switch (handlerEvent.httpMethod) {
        case 'GET': {
            const results = await daoCommTypes.getAll();

            const returnAs: Array<CommissionOption> = results.map(opt => ({
                Display: opt.display,
                Price: `${opt.price}`,
                Offer: `${opt.offer}`,
                ExampleURL: opt.example_url,
            }));
            return {
                statusCode: 200,
                body: JSON.stringify(returnAs),
            };
        }
        case 'POST': {
            if (!handlerEvent.body) {
                return { statusCode: 400, body: JSON.stringify({ message: 'missing body' }) };
            }

            const { Display, Price, Offer, ExampleURL } = JSON.parse(handlerEvent.body);

            await daoCommTypes.create(Display, Price, Offer, ExampleURL);

            return {
                statusCode: 200,
                body: JSON.stringify({message: 'Created Successfully'}),
            };
        }
        case 'PUT': {
            const display = (handlerEvent.path.split('/').pop() || '').split('?').shift();
            if (!display) {
                return { statusCode: 400, body: JSON.stringify({ message: 'missing display' }) };
            }

            if (!handlerEvent.body) {
                return { statusCode: 400, body: JSON.stringify({ message: 'missing body' }) };
            }

            const { Display: newDisplay, Price, Offer, ExampleURL } = JSON.parse(handlerEvent.body);

            await daoCommTypes.update(
                decodeURIComponent(display),
                newDisplay && decodeURIComponent(newDisplay),
                Price,
                Offer,
                ExampleURL,
            );

            return {
                statusCode: 200,
                body: JSON.stringify({message: 'Updated Successfully'}),
            };
        }
        case 'DELETE': {
            const display = (handlerEvent.path.split('/').pop() || '').split('?').shift();
            if (!display) {
                return { statusCode: 400, body: JSON.stringify({ message: 'missing display' }) };
            }

            await daoCommTypes.delete(decodeURIComponent(display));

            return {
                statusCode: 200,
                body: JSON.stringify({message: 'Deleted Successfully'}),
            };
        }
        default: {
            return {
                statusCode: 405,
                body: JSON.stringify({method: 'Invalid request method'}),
            };
        }
    }
});

export { handler };

const cookie = require('cookie');
const jwt = require('jsonwebtoken');

module.exports.handler = async function ({httpMethod, body}) {
    if (httpMethod !== 'POST') {
        return {
            statusCode: 410,
            body: JSON.stringify({method: 'Invalid request method'}),
        };
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
    const strCookie = cookie.serialize(
        'TamiArtToken',
        jwt.sign(
            {Token: strPassword},
            process.env.JWT_SECRET,
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

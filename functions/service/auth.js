const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const c_strStatusSuccess = 'Success';
const c_strStatusFailed = 'Failed';

module.exports = async function (objRequest) {
    let bPassed = false;

    try {
        const {TamiArtToken: strCookie} = cookie.parse(objRequest.headers.cookie);
        const objDecodedToken = jwt.verify(
            strCookie,
            process.env.JWT_SECRET,
        );

        bPassed = objDecodedToken.Token === process.env.TOKEN;
    } catch (err) {
        console.log('error in authorize:', err);
    }

    if (bPassed) {
        return {
            Status: c_strStatusSuccess,
        };
    }

    return {
        Status: c_strStatusFailed,
        Response: {
            statusCode: 401,
            headers: {
                'Set-Cookie': cookie.serialize(
                    'TamiArtToken',
                    '',
                    {
                        path: '/',
                        maxAge: 0,
                    }
                ),
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({message: 'Unauthorized'})
        },
    };
};

module.exports.STATUS_FAILED = c_strStatusFailed;
module.exports.STATUS_SUCCESS = c_strStatusSuccess;

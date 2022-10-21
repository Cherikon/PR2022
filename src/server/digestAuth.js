const http = require('http');
const crypt = require('crypto');
const fs = require('fs')
const credentials = {
    userName: 'sergey',
    password: 'cherikon1',
    realm: 'Digest Auth'
};
let hash;


function cryptoUsingMD5(data) {
    return crypt.createHash('md5').update(data).digest('hex');
}

hash = cryptoUsingMD5(credentials.realm);

function authenticateUser(res) {
    res.writeHead(401, { 'WWW-Authenticate': 'Digest realm="' + credentials.realm + '",qop="auth",nonce="' + Math.random() + '",opaque="' + hash + '"' });
    res.end('Authorization is needed.');
}

function parseAuthenticationInfo(authData) {
    let authenticationObj = {};
    authData.split(', ').forEach(function (d) {
        d = d.split('=');

        authenticationObj[d[0]] = d[1].replace(/"/g, '');
    });
    return authenticationObj;
}

http.createServer(function (request, response) {
    let authInfo, digestAuthObject = {};

    if (!request.headers.authorization) {
        authenticateUser(response);
        return;
    }

    authInfo = request.headers.authorization.replace(/^Digest /, '');
    authInfo = parseAuthenticationInfo(authInfo);

    if (authInfo.username !== credentials.userName) {
        authenticateUser(response); return;
    }

    digestAuthObject.ha1 = cryptoUsingMD5(authInfo.username + ':' + credentials.realm + ':' + credentials.password);

    digestAuthObject.ha2 = cryptoUsingMD5(request.method + ':' + authInfo.uri);

    digestAuthObject.response = cryptoUsingMD5([digestAuthObject.ha1, authInfo.nonce, authInfo.nc, authInfo.cnonce, authInfo.qop, digestAuthObject.ha2].join(':'));

    if (authInfo.response !== digestAuthObject.response) {
        authenticateUser(response); return;
    }
    response.writeHeader(200, {"Content-Type": "text/html"});
    fs.createReadStream( __dirname + '/index.html').pipe(response);

}).listen(8082);
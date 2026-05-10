const jwt = require('jsonwebtoken');

function signAccess(payload, secret, expiresIn = '15m'){
  return jwt.sign(payload, secret, { expiresIn });
}

function signRefresh(payload, secret, expiresIn = '30d'){
  return jwt.sign(payload, secret, { expiresIn });
}

function verify(token, secret){
  return jwt.verify(token, secret);
}

module.exports = { signAccess, signRefresh, verify };

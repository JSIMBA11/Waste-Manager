const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'development_secret_key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  jwt.verify(token, SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = payload;
    next();
  });
}

const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'development_secret_key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  jwt.verify(token, SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = payload;
    next();
  });
}

module.exports = { authenticateToken };
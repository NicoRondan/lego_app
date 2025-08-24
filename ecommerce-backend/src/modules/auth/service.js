const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { RefreshToken } = require('../../infra/models');

function parseDuration(str) {
  const match = String(str).match(/(\d+)([smhd])/);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
  return num * ms;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function issueTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.ACCESS_TOKEN_TTL || '10m' },
  );
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await RefreshToken.destroy({ where: { userId } });
  await RefreshToken.create({
    token: hashed,
    userId,
    expiresAt: new Date(Date.now() + parseDuration(process.env.REFRESH_TOKEN_TTL || '30d')),
  });
  return { accessToken, refreshToken };
}

function setAuthCookies(res, { accessToken, refreshToken, csrfToken }) {
  const base = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    domain: process.env.COOKIE_DOMAIN || undefined,
  };
  res.cookie('accessToken', accessToken, {
    ...base,
    maxAge: parseDuration(process.env.ACCESS_TOKEN_TTL || '10m'),
  });
  res.cookie('refreshToken', refreshToken, {
    ...base,
    maxAge: parseDuration(process.env.REFRESH_TOKEN_TTL || '30d'),
  });
  res.cookie('csrfToken', csrfToken, {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    domain: process.env.COOKIE_DOMAIN || undefined,
  });
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('csrfToken');
}

function verifyCsrf(req) {
  const tokenCookie = req.cookies && req.cookies.csrfToken;
  const headerToken = req.headers['x-csrf-token'];
  if (!tokenCookie || !headerToken || tokenCookie !== headerToken) {
    const err = new Error('Invalid CSRF token');
    err.status = 403;
    throw err;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  issueTokens,
  setAuthCookies,
  clearAuthCookies,
  verifyCsrf,
};

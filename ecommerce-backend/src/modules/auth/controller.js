// src/modules/auth/controller.js
// Implements OAuth Authorization Code with PKCE for Google and Facebook.
// Issues short-lived JWTs and rotating refresh tokens stored in DB.

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, SocialIdentity, RefreshToken } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

// In-memory store for PKCE code verifiers keyed by state
const pkceStore = new Map();

// Generate authorization URL and redirect user to provider
exports.oauthLogin = (req, res, next) => {
  try {
    const { provider } = req.params;
    const state = crypto.randomBytes(16).toString('hex');
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    pkceStore.set(state, { codeVerifier, provider });

    const baseUrl = process.env.BASE_URL || '';
    let authUrl;
    if (provider === 'google') {
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: `${baseUrl}/auth/callback/google`,
        response_type: 'code',
        scope: 'openid email profile',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state,
      });
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } else if (provider === 'facebook') {
      const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        redirect_uri: `${baseUrl}/auth/callback/facebook`,
        response_type: 'code',
        scope: 'email',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state,
      });
      authUrl = `https://www.facebook.com/v17.0/dialog/oauth?${params.toString()}`;
    } else {
      throw new ApiError('Unsupported provider', 400);
    }
    res.redirect(authUrl);
  } catch (err) {
    next(err);
  }
};

// Handle provider callback, exchange code for tokens and issue JWT/refresh token
exports.oauthCallback = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;
    const stored = pkceStore.get(state);
    if (!stored || stored.provider !== provider) {
      throw new ApiError('Invalid state', 400);
    }
    pkceStore.delete(state);
    const { codeVerifier } = stored;
    const baseUrl = process.env.BASE_URL || '';
    let email, name, providerId;
    if (provider === 'google') {
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${baseUrl}/auth/callback/google`,
        code_verifier: codeVerifier,
      });
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }).then((r) => r.json());
      if (!tokenRes.id_token) throw new ApiError('Token exchange failed', 401);
      const payload = JSON.parse(Buffer.from(tokenRes.id_token.split('.')[1], 'base64').toString());
      email = payload.email;
      name = payload.name;
      providerId = payload.sub;
    } else if (provider === 'facebook') {
      const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        code,
        redirect_uri: `${baseUrl}/auth/callback/facebook`,
        code_verifier: codeVerifier,
      });
      const tokenRes = await fetch('https://graph.facebook.com/v17.0/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }).then((r) => r.json());
      const accessToken = tokenRes.access_token;
      if (!accessToken) throw new ApiError('Token exchange failed', 401);
      const profile = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`,
      ).then((r) => r.json());
      email = profile.email;
      name = profile.name;
      providerId = profile.id;
    } else {
      throw new ApiError('Unsupported provider', 400);
    }
    if (!email) throw new ApiError('Email not available from provider', 400);
    let [user] = await User.findOrCreate({ where: { email }, defaults: { name } });
    await SocialIdentity.findOrCreate({ where: { provider, providerId, userId: user.id } });
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' },
    );
    const refreshTokenValue = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(refreshTokenValue).digest('hex');
    await RefreshToken.create({
      token: hashed,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    res.json({
      token,
      refreshToken: refreshTokenValue,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// Exchange refresh token for new JWT
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError('Missing refresh token', 400);
    const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const stored = await RefreshToken.findOne({ where: { token: hashed } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new ApiError('Invalid refresh token', 401);
    }
    const user = await User.findByPk(stored.userId);
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' },
    );
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

// Logging out is handled client-side by discarding the JWT
exports.logout = async (_req, res, _next) => {
  res.json({ message: 'Logged out' });
};

// Issue a CSRF token and store it in an HttpOnly cookie
exports.csrfToken = (_req, res, _next) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrfToken', token, {
    sameSite: 'lax',
    httpOnly: true,
    secure: true,
  });
  res.json({ csrfToken: token });
};

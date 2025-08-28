const crypto = require('crypto');
const { User, SocialIdentity, RefreshToken, AdminImpersonationToken, AdminAuditLog } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');
const {
  hashPassword,
  verifyPassword,
  issueTokens,
  setAuthCookies,
  clearAuthCookies,
  verifyCsrf,
} = require('./service');
const { registerSchema, loginSchema } = require('./schema');

// In-memory store for PKCE code verifiers keyed by state
const pkceStore = new Map();

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new ApiError('Email already registered', 400);
    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash });
    const csrfToken = crypto.randomBytes(16).toString('hex');
    const tokens = await issueTokens(user.id, user.role);
    setAuthCookies(res, { ...tokens, csrfToken });
    res
      .status(201)
      .json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ where: { email } });
    if (!user || !user.passwordHash) throw new ApiError('Invalid credentials', 401);
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new ApiError('Invalid credentials', 401);
    const csrfToken = crypto.randomBytes(16).toString('hex');
    const tokens = await issueTokens(user.id, user.role);
    setAuthCookies(res, { ...tokens, csrfToken });
    try { if (['superadmin','catalog_manager','oms','support','marketing','admin'].includes(user.role)) { await AdminAuditLog.create({ action: 'admin_login', targetUserId: user.id, ip: req.ip }); } } catch {}
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies && req.cookies.refreshToken;
    if (!refreshToken) throw new ApiError('Missing refresh token', 401);
    const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const stored = await RefreshToken.findOne({ where: { token: hashed } });
    if (!stored || stored.expiresAt < new Date() || stored.revokedAt) {
      throw new ApiError('Invalid refresh token', 401);
    }
    await stored.update({ revokedAt: new Date() });
    const csrfToken = crypto.randomBytes(16).toString('hex');
    const user = await User.findByPk(stored.userId);
    const tokens = await issueTokens(stored.userId, user.role);
    setAuthCookies(res, { ...tokens, csrfToken });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    verifyCsrf(req);
    const refreshToken = req.cookies && req.cookies.refreshToken;
    if (refreshToken) {
      const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await RefreshToken.destroy({ where: { token: hashed } });
    }
    clearAuthCookies(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.oauthGoogleStart = (req, res, next) => {
  try {
    const { code_challenge, code_verifier, redirect_uri } = req.query;
    if (!code_challenge || !code_verifier || !redirect_uri) {
      throw new ApiError('Missing parameters', 400);
    }
    const state = crypto.randomBytes(16).toString('hex');
    pkceStore.set(state, { redirect_uri, code_challenge, code_verifier });
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      code_challenge,
      code_challenge_method: 'S256',
      state,
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch (err) {
    next(err);
  }
};

exports.oauthGoogleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const stored = pkceStore.get(state);
    if (!stored) throw new ApiError('Invalid state', 400);
    pkceStore.delete(state);
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        code_verifier: stored.code_verifier,
      }).toString(),
    }).then((r) => r.json());
    if (!tokenRes.id_token) throw new ApiError('Token exchange failed', 401);
    const payload = JSON.parse(Buffer.from(tokenRes.id_token.split('.')[1], 'base64').toString());
    const email = payload.email;
    const name = payload.name;
    const providerId = payload.sub;
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({ name, email });
    }
    await SocialIdentity.findOrCreate({ where: { provider: 'google', providerId, userId: user.id } });
    const csrfToken = crypto.randomBytes(16).toString('hex');
    const tokens = await issueTokens(user.id, user.role);
    setAuthCookies(res, { ...tokens, csrfToken });
    res.redirect(`${stored.redirect_uri}?ok=1`);
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError('Unauthorized', 401);
    }
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role'],
    });
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};

exports.csrfToken = (_req, res) => {
  const token = crypto.randomBytes(16).toString('hex');
  res.cookie('csrfToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    domain: process.env.COOKIE_DOMAIN || undefined,
  });
  res.json({ csrfToken: token });
};

exports.impersonate = async (req, res, next) => {
  try {
    const token = req.method === 'GET' ? req.query.token : (req.body && req.body.token);
    if (!token) throw new ApiError('Missing token', 400);
    const rec = await AdminImpersonationToken.findByPk(token);
    if (!rec) throw new ApiError('Invalid token', 400);
    if (rec.usedAt) throw new ApiError('Token already used', 400);
    if (rec.expiresAt < new Date()) throw new ApiError('Token expired', 400);
    const user = await User.findByPk(rec.userId);
    if (!user) throw new ApiError('User not found', 404);
    // mark token used
    rec.usedAt = new Date();
    await rec.save();
    const csrfToken = crypto.randomBytes(16).toString('hex');
    const tokens = await issueTokens(user.id, user.role);
    setAuthCookies(res, { ...tokens, csrfToken });
    // lightweight flag to show banner in FE
    res.cookie('impersonation', '1', {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 15 * 60 * 1000,
    });
    await AdminAuditLog.create({ action: 'impersonate_login', targetUserId: user.id, ip: req.ip, detail: { token } });
    res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

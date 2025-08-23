// src/modules/auth/controller.js
// Business logic for authentication routes. Handles social login by
// creating or updating User and SocialIdentity records, then returning a
// signed JWT for client use. Uses JWT secret defined in environment.

const jwt = require('jsonwebtoken');
const { User, SocialIdentity } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

// Log in with a social provider. The client must already have obtained
// providerId (sub) and user info (name, email) via OAuth. This endpoint
// simply maps the provider user to a local User record and issues a JWT.
exports.login = async (req, res, next) => {
  try {
    const { provider, providerId, name, email } = req.body;
    if (!provider || !providerId || !email) {
      throw new ApiError('Missing required fields: provider, providerId, email', 400);
    }
    // Find or create the local user
    let [user] = await User.findOrCreate({ where: { email }, defaults: { name } });
    if (user.name !== name && name) {
      user.name = name;
      await user.save();
    }
    // Associate social identity
    await SocialIdentity.findOrCreate({ where: { provider, providerId, userId: user.id } });
    // Sign JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

// Logging out is handled client-side by discarding the JWT. This endpoint
// simply returns a message for completeness.
exports.logout = async (_req, res, _next) => {
  res.json({ message: 'Logged out' });
};
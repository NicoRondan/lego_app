// Environment and configuration loader
// This file centralizes environment variables and provides sensible defaults.

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_URI: process.env.DB_URI || 'sqlite::memory:',
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || '',
  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || ''
};
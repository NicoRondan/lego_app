// src/infra/mailer.js
// Stubbed mailer service for sending transactional emails. In a real
// application you might use nodemailer or a third-party provider. This
// implementation logs messages to the console.

const { log } = require('../shared/logger');

async function sendMail({ to, subject, text, html }) {
  // In production, integrate with SMTP or a transactional email API
  log(`Sending email to ${to}: ${subject}`);
  log(text || html);
  return true;
}

module.exports = { sendMail };
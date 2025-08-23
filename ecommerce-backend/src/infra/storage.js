// src/infra/storage.js
// Stubbed storage service for uploading files (e.g. product images). In a
// real implementation you could integrate with AWS S3, Google Cloud
// Storage, or another provider. Here we simply log the action.

const { log } = require('../shared/logger');

async function uploadFile(fileBuffer, filename) {
  // Example: write to local disk or a mock location
  log(`Uploading file ${filename} (${fileBuffer.length} bytes)`);
  // Return a fake URL for demonstration
  const url = `https://storage.example.com/${filename}`;
  return url;
}

module.exports = { uploadFile };
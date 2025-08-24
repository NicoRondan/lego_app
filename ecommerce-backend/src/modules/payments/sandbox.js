// src/modules/payments/sandbox.js
// Mock Mercado Pago webhook payloads used for E2E testing.
// Provides static examples for approved, rejected and pending payments.

module.exports = {
  approved: {
    paymentId: 'sandbox-payment-approved',
    status: 'approved',
  },
  rejected: {
    paymentId: 'sandbox-payment-rejected',
    status: 'rejected',
  },
  pending: {
    paymentId: 'sandbox-payment-pending',
    status: 'pending',
  },
};

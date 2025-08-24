// cypress/e2e/payment_sandbox.cy.js
// Basic E2E tests ensuring the sandbox endpoint provides
// mock payloads for payment statuses.

describe('Payment sandbox', () => {
  const statuses = ['approved', 'rejected', 'pending'];

  statuses.forEach((status) => {
    it(`returns ${status} payload`, () => {
      cy.fixture(`payment-${status}.json`).then((expected) => {
        cy.request(`/payments/mp/sandbox/${status}`).its('body').should('deep.equal', expected);
      });
    });
  });
});

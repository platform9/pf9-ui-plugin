describe('login', () => {
  it('reports failed logins', () => {
    cy.visit('/')
    cy.get('[data-test-id=login-email]').type(Cypress.env('userName'))
    cy.get('[data-test-id=login-password]').type(Cypress.env('password'))
    cy.get('[data-test-id=login-submit-btn]', { timeout: 5000 }).click()
    cy.url().should('include', 'ui/kubernetes/dashboard')
  })
})

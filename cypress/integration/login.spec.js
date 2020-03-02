describe('Login', () => {
  it('login into application', () => {
    cy.visit('/')
    cy.get('[data-testid=login-email]').type(Cypress.env('userName'))
    cy.get('[data-testid=login-password]').type(Cypress.env('password'))
    cy.get('[data-testid=login-submit-btn]', { timeout: 5000 }).click()
    cy.url().should('include', 'ui/kubernetes/dashboard')
  })
})

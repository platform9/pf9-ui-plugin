describe('Login', () => {
  it('login into application', () => {
    cy.visit('/')
    cy.get('[data-testid=login-email]').type(Cypress.env('userName'))
    cy.get('[data-testid=login-password]').type(Cypress.env('password'))
    cy.get('[data-testid=login-submit-btn]').click()
    // For dev testing it is taking time to login
    cy.wait(5000)
    cy.url().should('include', 'ui/kubernetes/dashboard')
  })
})

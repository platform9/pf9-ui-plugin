describe('Logout user', () => {
  before(() => {
    cy.login()
  })

  it('logout user from application', () => {
    cy.get('[data-testid=user-menu]')
      .should('contain', Cypress.env('userName'))
      .click()
    cy.get('[data-testid=user-menu-sign-out]')
      .should('exist')
      .click()
    cy.get('[data-testid=login-email]').should('exist')
    cy.get('[data-testid=login-password]').should('exist')
    cy.get('[data-testid=login-submit-btn]').should('exist')
  })
})

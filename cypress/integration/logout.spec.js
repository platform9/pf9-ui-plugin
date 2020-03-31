describe('Logout user', () => {
  before(() => {
    cy.login()
  })

  it('logout user from application', () => {
    cy.get('[data-test-id=user-menu]')
      .contains(Cypress.env('userName'))
      .click()
    cy.get('[data-test-id=user-menu-sign-out]')
      .should('exist')
      .click()
    cy.get('[data-test-id=login-email]').should('exist')
    cy.get('[data-test-id=login-password]').should('exist')
    cy.get('[data-test-id=login-submit-btn]').should('exist')
  })
})

describe('Users', () => {
  before(() => {
    cy.login()
    cy.visit('/ui/kubernetes/user_management#users')
  })

  context('create user', () => {
    it('shows the create user dialog', () => {
      cy.get('[data-test-id=list-container-create-btn]')
        .should('exist', 'contains', 'Create a new User')
        .click()
      cy.get('[data-test-id=form-wrapper-container]').should('exist')
    })

    it('fills the name and description fields and move to next step', () => {
      cy.get('[data-test-id=user-name]').type(Cypress.env('users').userName)
      cy.get('[data-test-id=add-user-page-basic-info-display-name]').type(
        Cypress.env('users').userName,
      )
      cy.get('[data-test-id=add-user-page-basic-info-activation-by-password]').click()
      cy.get('[data-test-id=user-password-field]').type(Cypress.env('users').password)
      cy.get('[data-test-id=wizard-next-btn]').click()
    })

    it('select the users and roles and submit', () => {
      cy.get('[data-test-id=list-table-checkbox]')
        .first()
        .click()
      cy.get('[data-test-id=pick-list-text-field]>div')
        .first()
        .click()
      cy.get('[data-test-id=pick-list-menu-item]')
        .first()
        .click()
      cy.get('[data-test-id=wizard-submit-btn]').click({ force: true })
      cy.get('[data-test-id=toast-container]').should('exist')
      cy.get('[data-test-id=toast-container]', { timeout: 3000 }).should(
        'exist',
        'contains',
        Cypress.env('users').userName,
      )
      cy.wait(3000)
    })

    it('confirm newly created user', () => {
      cy.get('[data-test-id=search-bar-text-field] input').type(Cypress.env('users').userName)
      cy.get('[data-test-id=list-table-row]').should('have.length', 1)
      cy.get('[data-test-id=search-bar-text-field] input').clear()
    })

    it('delete the newly created user', () => {
      cy.get('[data-test-id=search-bar-text-field] input').type(Cypress.env('users').userName)
      cy.get('[data-test-id=list-table-row]').should('have.length', 1)
      cy.get('[data-test-id=list-table-radio]').click()
      cy.get('[data-test-id=list-table-batch-action-Delete]').click()
      cy.get('[data-test-id=confirmation-dialog-display-text]').should(
        'contain',
        Cypress.env('users').userName,
      )
      cy.get('[data-test-id=confirmation-dialog-confirm-btn]').click()
      cy.get('[data-test-id=search-bar-text-field] input').clear()
    })

    it('confirm the deleted entry is not present is list', () => {
      cy.get('[data-test-id=search-bar-text-field] input').type(Cypress.env('users').userName)
      cy.get('[data-test-id=list-table-row]').should('not.exist')
    })
  })
})

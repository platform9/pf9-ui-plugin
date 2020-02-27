describe('users', () => {
  before(() => {
    cy.login()
    cy.visit('/ui/kubernetes/user_management#users')
  })

  context('create user', () => {
    it('shows the create user dialog', () => {
      cy.get('[data-testid=list-container-create-btn]')
        .should('exist', 'contains', 'Create a new User')
        .click()
      cy.get('[data-testid=form-wrapper-container]').should('exist')
    })

    it('fills the name and description fields and move to next step', () => {
      cy.get('[data-testid=add-user-page-basic-info-user-name]').type(Cypress.env('users').userName)
      cy.get('[data-testid=add-user-page-basic-info-display-name]').type(
        Cypress.env('users').userName,
      )
      cy.get('[data-testid=add-user-page-basic-info-activation-by-password]').click()
      cy.get('[data-testid=user-password-field]').type(Cypress.env('users').password)
      cy.get('[data-testid=wizard-next-btn]').click()
    })

    it('select the users and roles and submit', () => {
      cy.get('[data-testid=list-table-checkbox]')
        .first()
        .click()
      cy.get('[data-testid=pick-list-text-field]>div')
        .first()
        .click()
      cy.get('[data-testid=pick-list-menu-item]')
        .first()
        .click()
      cy.get('[data-testid=wizard-submit-btn]').click({ force: true })
      cy.get('[data-testid=toast-container]').should('exist')
      cy.get('[data-testid=toast-container]').should(
        'exist',
        'contains',
        Cypress.env('users').userName,
      )
      cy.wait(3000)
    })

    it('confirm newly created user', () => {
      cy.get('[data-testid=search-bar-text-field] input').type(Cypress.env('users').userName)
      cy.get('[data-testid=list-table-row]').should('have.length', 1)
      cy.get('[data-testid=search-bar-text-field] input').clear()
    })

    it('delete the newly created user', () => {
      cy.get('[data-testid=search-bar-text-field] input').type(Cypress.env('users').userName)
      cy.get('[data-testid=list-table-row]').should('have.length', 1)
      cy.get('[data-testid=list-table-radio]').click()
      cy.get('[data-testid=list-table-batch-action-Delete]').click()
      cy.get('[data-testid=confirmation-dialog-display-text]').should(
        'contain',
        Cypress.env('users').userName,
      )
      cy.get('[data-testid=confirmation-dialog-confirm-btn]').click()
      cy.get('[data-testid=search-bar-text-field] input').clear()
    })

    it('confirm the deleted entry is not present is list', () => {
      cy.get('[data-testid=search-bar-text-field] input').type(Cypress.env('users').userName)
      cy.get('[data-testid=list-table-row]').should('not.exist')
    })
  })
})

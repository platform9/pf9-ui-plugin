describe('users', () => {
  before(() => {
    cy.resetServerContext('dev')
    cy.login()
    cy.visit('/ui/account/user_management#users')
  })

  context('list users', () => {
    it('lists users', () => {
      cy.contains('tr', 'Test user 5')
      cy.contains('tr', 'admin@platform9.com')
    })
  })

  context('create user', () => {
    it('shows the create user dialog', () => {
      cy.contains('button', 'Create a new User').click()
      cy.contains('New User')
    })

    it('fills the name and description fields and move to next step', () => {
      cy.get('input#username')
        .clear()
        .type('User#Test')
      cy.get('input#displayname')
        .clear()
        .type('User#Test')
      cy.get('input#password')
        .clear()
        .type('Secret-123')

      cy.contains('button', 'Next').click()
      cy.contains('Select one or more tenants that should map to this user')
    })

    it('select the users and roles and submit', () => {
      cy.contains('tr', 'Tenant #0')
        .find('.MuiCheckbox-root')
        .click()
      cy.contains('button', 'Complete').click()
      cy.contains('User User#Test created successfully')
      cy.contains('tr', 'User#Test')
    })

    // TODO We should try to login with the newly created user
  })

  context('edit user', () => {
    it('shows the edit user dialog', () => {
      cy.contains('tr', 'User#Test').click()
      cy.contains('div', 'Edit').click()
      cy.contains('Edit User User#Test')
    })

    it('updates the user name and passsword and move to next step', () => {
      cy.contains('.togglableField', 'Username or Email')
        .find('a')
        .click()
      cy.contains('.togglableField', 'Display Name')
        .find('a')
        .click()
      cy.contains('.togglableField', 'Password')
        .find('a')
        .click()

      cy.get('input#username')
        .clear()
        .type('User#Test *EDITED*')
      cy.get('input#displayname')
        .clear()
        .type('User#Test *EDITED*')
      cy.get('input#password')
        .clear()
        .type('Secret-321')

      cy.contains('button', 'Next').click()
      cy.contains('Select one or more tenants that should map to this user')
    })

    it('change selected tenants and roles and submit', () => {
      cy.contains('tr', 'Tenant #0')
        .find('.MuiCheckbox-root')
        .click()

      cy.contains('tr', 'Tenant #2')
        .find('.MuiSelect-root')
        .click()
      cy.contains('li', 'admin').click()

      cy.contains('button', 'Complete').click()
      cy.contains('User User#Test updated successfully')
      cy.contains('User#Test *EDITED*')
    })
  })

  context('remove user', () => {
    it('delete the newly created user', () => {
      cy.contains('tr', 'User#Test *EDITED*').click()
      cy.contains('Delete').click()
      cy.contains('Are you sure?')
      cy.contains('Confirm').click()
      cy.contains('User User#Test *EDITED* deleted successfully')
      cy.contains('tr', 'User#Test *EDITED*').should('not.exist')
    })
  })
})

describe('users', () => {
  beforeEach(() => {
    cy.login()
  })

  context('list users', () => {
    it('lists users', () => {
      cy.visit('/ui/kubernetes/user_management#users')
      cy.contains('tenant1User5@platform9.com')
      cy.contains('admin@platform9.com')
    })
  })

  context('create user', () => {
    it('shows the create user dialog', () => {
      cy.contains('+ Create New User').click()
      cy.contains('New User')

      cy.get('input#name').clear().type('User#Test')
      cy.get('input#description').clear().type('User#Test Description')
      cy.get('input#password').clear().type('Secret-123')

      cy.contains('Next').click()

      cy.contains('User #1').click()
      cy.contains('service').click()
      cy.contains('Complete').click()

      cy.contains('User#Test')

      // TODO We should try to login with the newly created user
    })
  })

  context('edit user', () => {
    it('shows the edit user dialog', () => {
      cy.contains('admin@platform9.com').click()
      cy.contains('Edit User admin@platform9.com')
    })

    it('updates the user name and passsword and move to next step', () => {
      cy.get('input#name').clear().type('User#Test edited')
      cy.get('input#password').clear().type('Secret-321')
      cy.contains('Next').click()
      cy.contains('Select one or more tenants that should map to this User.')
    })

    it('change selected tenants and roles and submit', () => {
      cy.get('tr.Mui-selected')
        .first()
        .should('contain', 'User #1')
        .click()

      cy.contains('User #2').click()
      cy.get('tr.Mui-selected')
        .last()
        .find('#roleId').select('admin').wait(200)

      cy.contains('Complete').click().wait(1000)
      cy.contains('User User#Test updated successfully')
      cy.contains('User#Test edited')
    })
  })

  context('remove user', () => {
    it('delete the newly created user', () => {
      cy.contains('User#Test').click()
      cy.contains('Delete').click().wait(200)
      cy.contains('Are you sure?')
      cy.contains('Confirm').click()
      cy.contains('User User#Test deleted successfully')
      cy.contains('tenant1User5@platform9.com').should('not.exist')
    })
  })
})

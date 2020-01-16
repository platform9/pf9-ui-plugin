describe('tenants', () => {
  beforeEach(() => {
    cy.login()
  })

  context('list tenants', () => {
    it('lists tenants', () => {
      cy.visit('/ui/kubernetes/user_management#tenants')
      cy.contains('Tenant #1')
      cy.contains('service')
    })
  })

  context('create tenant', () => {
    it('shows the create tenant dialog', () => {
      cy.contains('+ Create a New Tenant').click()
      cy.contains('New Tenant')
    })

    it('fills the name and description fields and move to next step', () => {
      cy.get('input#name').clear().type('Tenant#Test')
      cy.get('input#description').clear().type('Tenant#Test Description')
      cy.contains('Next').click()
      cy.contains('Select one or more users that should map to this Tenant')
    })

    it('select the users and roles and submit', () => {
      cy.contains('tenant1User5@platform9.com').click().wait(200)
      cy.contains('Complete').click().wait(1000)
      cy.contains('Tenant Tenant#Test created successfully')
      cy.contains('Tenant#Test')
    })
  })

  context('edit tenant', () => {
    it('shows the edit tenant dialog', () => {
      cy.contains('Tenant#Test').click()
      cy.contains('Edit').click().wait(200)
      cy.contains('Edit Tenant Tenant#Test')
    })

    it('updates the tenant name and description and move to next step', () => {
      cy.get('input#name').clear().type('Tenant#Test edited')
      cy.get('input#description').clear().type('Tenant#Test Description edited')
      cy.contains('Next').click()
      cy.contains('Which users can access this tenant?')
    })

    it('change selected users and roles and submit', () => {
      cy.get('tr.Mui-selected')
        .first()
        .should('contain', 'tenant1User5@platform9.com')
        .click()

      cy.contains('tenant2User7@platform9.com').click()
      cy.get('tr.Mui-selected')
        .last()
        .find('#roleId').select('admin').wait(200)

      cy.contains('Complete').click().wait(1000)
      cy.contains('Tenant Tenant#Test updated successfully')
      cy.contains('Tenant#Test edited')
    })
  })

  context('remove tenant', () => {
    it('delete the newly created tenant', () => {
      cy.contains('Tenant #1').click()
      cy.contains('Delete').click().wait(200)
      cy.contains('Are you sure?')
      cy.contains('Confirm').click().wait(1000)
      cy.contains('Tenant Tenant#Test deleted successfully')
      cy.contains('Tenant #1').should('not.exist')
    })
  })
})

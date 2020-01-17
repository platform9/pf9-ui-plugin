describe('tenants', () => {
  before(() => {
    cy.resetServerContext('dev')
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
      cy.contains('Test user 5').click().wait(200)
      cy.contains('Complete').click().wait(1000)
      cy.contains('Tenant Tenant#Test created successfully')
      cy.contains('tr', 'Tenant#Test')
    })
  })

  context('edit tenant', () => {
    it('shows the edit tenant dialog', () => {
      cy.contains('tr', 'Tenant#Test').click().wait(200)
      cy.contains('Edit').click().wait(200)
      cy.contains('Edit Tenant Tenant#Test')
    })

    it('updates the tenant name and description and move to next step', () => {
      cy.get('input#name').clear().type('Tenant#Test #EDITED#')
      cy.get('input#description').clear().type('Tenant#Test Description edited')
      cy.contains('Next').click()
      cy.contains('Which users can access this tenant?')
    })

    it('change selected users and roles and submit', () => {
      cy.contains('tr', 'Test user 5')
        .find('.MuiCheckbox-root').click()
        .wait(200)

      cy.contains('tr', 'Test user 7')
        .find('.MuiSelect-root').click()

      cy.contains('li', 'admin').click().wait(200)

      cy.contains('Complete').click().wait(1000)
      cy.contains('Tenant Tenant#Test updated successfully')
      cy.contains('Tenant#Test #EDITED#')
    })
  })

  context('remove tenant', () => {
    it('delete the newly created tenant', () => {
      cy.contains('Tenant#Test #EDITED#').click()
      cy.contains('Delete').click().wait(200)
      cy.contains('Are you sure?')
      cy.contains('Confirm').click().wait(1000)
      cy.contains('Tenant Tenant#Test #EDITED# deleted successfully')
      cy.contains('tr', 'Tenant#Test #EDITED#').should('not.exist')
    })
  })
})

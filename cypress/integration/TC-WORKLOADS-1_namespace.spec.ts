import 'cypress-wait-until'
import { loadConfig } from 'cypress/support/commands'
import { Config } from 'cypress/support/types'

describe('Namespace Creation', () => {
  var config: Config
  before(() => {
    config = loadConfig()
    cy.login()
  })

  it('Should be able to add Namespace', () => {
    cy.contains('Workloads').click()
    cy.get('[href="#namespaces"]')
      .contains('Namespaces')
      .click()
    cy.contains('+ Add Namespace').click()
    cy.get('#name').type(config.namespaceName)
    cy.get('#clusterId').click()
    cy.get('ul')
      .find('li')
      .eq(1)
      .click()
    cy.get('[type="submit"]').click()
    cy.wait(20000)
    cy.get('input[type="Search"]').type(config.namespaceName)
    cy.contains(config.namespaceName)
  })
})

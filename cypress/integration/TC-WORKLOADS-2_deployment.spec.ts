import 'cypress-wait-until'
import { loadConfig } from 'cypress/support/commands'
import { Config } from 'cypress/support/types'

describe('Cluster Deployment Flow', () => {
  var config: Config
  before(() => {
    config = loadConfig()
    cy.login()
  })

  it('Should be able to navigate to Deployments', () => {
    cy.contains('Workloads').click()
    cy.get('[href="#deployments"]')
      .contains('Deployments')
      .click()
    cy.contains('+ Add Deployment').click()
  })

  it('Should be able to add Deployment', () => {
    cy.get('p').should('contain.text', 'Add a Deployment')
    cy.wait(5000)
    cy.get('#clusterId', { timeout: 5000 }).click()
    cy.get('ul')
      .find('li')
      .eq(1)
      .click()
    cy.wait(5000)
    cy.get('#namespace').click()
    cy.get('li').should('contain', config.namespaceName)
    cy.get('li')
      .contains(config.namespaceName)
      .click()
    cy.get('button[type="button"]')
      .should('contain.text', 'Deployment')
      .click()
    cy.get('button[type="submit"]')
      .should('contain.text', 'Deployment')
      .click()
    cy.wait(8000)
  })

  it('Should be able to verify that Deployment is created', () => {
    cy.get('#mui-component-select-Cluster').click()
    cy.get('li').should('contain.text', config.singleMasterClusterData.clusterName)
    cy.get('li')
      .contains(config.singleMasterClusterData.clusterName)
      .click()
    cy.get('#mui-component-select-Namespace').click()
    cy.get('li').should('contain.text', config.namespaceName)
    cy.get('li')
      .contains(config.namespaceName)
      .click()
    cy.get('td')
      .contains(config.singleMasterClusterData.clusterName)
      .should('be.visible')
    cy.get('td')
      .contains(config.namespaceName)
      .should('be.visible')
  })
})

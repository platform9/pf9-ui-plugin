import 'cypress-wait-until'
import { loadConfig } from 'cypress/support/commands'
import { Config } from 'cypress/support/types'

describe('One Click Cluster Creation', () => {
  var config: Config 
  before(() => {
    config=loadConfig()
    cy.login()
    cy.minHealthyNodesRequired(config.oneClickClusterData.totalNodes)
  })

  it('Should be able add cluster of type "One-Click Cluster"', () => {
    cy.intercept('GET', /\/.*clusters\/supportedRoleVersions$/).as('supportedRoleVersions')
    cy.get("a[href='/ui/kubernetes/infrastructure/clusters/add']", { timeout: 3000 }).click()
    cy.contains('BareOS Virtual Cluster')
    cy.getByTestId('One-Click Cluster').click()
    cy.wait('@supportedRoleVersions')
    cy.get('#name').type(config.oneClickClusterData.clusterName)
    cy.get('#kubeRoleVersion').click()
    cy.get("li[data-value='1.18.10-pmk.1547']").click()
  })

  it('Should be able to select a node', () => {
    // var desiredNodeCount = 1
    // cy.getByTestId('node-selection').each(($el) => {
    //   cy.wrap($el).click()
    //   desiredNodeCount--
    //   if (desiredNodeCount === 0) return false
    //   return false
    // })
    cy.selectMasterNodes(1)
  })

  it('Should be able to review and complete setting up the cluster', () => {
    cy.contains('Complete').click()
  })

  it('Should be able to verify Cluster Creation Completed Successfully', () => {
    cy.wait(240000).then(() => {
      cy.getByTestId('progress-bar-status').each(($el: string) => {
        cy.get($el).contains(/^Completed all [0-9]+ tasks successfully$/)
      })
    })
  })

  after(() => {
    cy.deleteCluster(config.oneClickClusterData.clusterName)
  })
})

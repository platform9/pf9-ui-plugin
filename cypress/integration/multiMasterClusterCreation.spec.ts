import 'cypress-wait-until'
import { loadConfig } from 'cypress/support/commands'
import { Config } from 'cypress/support/types'

describe('Multi Master Cluster Creation', () => {
  var config: Config
  before(() => {
    config = loadConfig()
    cy.login()
    cy.minHealthyNodesRequired(config.multiMasterClusterData.totalNodes)
  })

  it('Should be able add cluster of type "MultiMaster"', () => {
    cy.intercept('GET', /\/.*clusters\/supportedRoleVersions$/).as('supportedRoleVersions')
    cy.get("a[href='/ui/kubernetes/infrastructure/clusters/add']", { timeout: 3000 }).click()
    cy.contains('BareOS Virtual Cluster')
    cy.getByTestId('Multi-Master Cluster').click()
    cy.wait('@supportedRoleVersions')
    cy.get('#name').type(config.multiMasterClusterData.clusterName)
    cy.get('#kubeRoleVersion').click()
    cy.get("li[data-value='1.18.10-pmk.1547']").click()
    cy.contains('Make Master nodes Master + Worker').click()
    cy.contains('Network Plugin Operator').click()
    cy.contains('IPv4').parentsUntil('span').find("input[type='radio']").should('be.checked')
    cy.contains('Next').click()
  })


  it('Should be able to setup Master Node', () => {
    cy.contains('Select nodes to add as Master Node')
    cy.selectMasterNodes(config.multiMasterClusterData.masterNodes)
    cy.contains('Next').click()
  })

  it('Should be able to setup Worker Nodes', () => {
    cy.contains('Select nodes to add as Worker Nodes')
    cy.selectWorkerNodes(config.multiMasterClusterData.workerNodes)
    cy.contains('Next').click()
  })
  it('Should be able to setup Network', () => {
    cy.contains('Cluster Networking Range & HTTP Proxy')
    cy.get('#masterVipIpv4').type(config.multiMasterClusterData.virtualIP)
    cy.get('#masterVipIface').click()
    cy.get('[data-value="ens3"]').click()
    cy.get('#masterVipIface').should('contain', 'ens3')

    // TODO: Add validations
    cy.contains('Next').click()
  })
  it('Should be able to setup Advanced Configuration', () => {
    cy.contains('Advanced API Configuration')
    // TODO: Add validations
    cy.contains('Next').click()
  })
  it('Should be able to review and complete setup of the cluster', () => {
    cy.contains('Finish and Review')
    // TODO: Add validations
    cy.contains('Complete').click()
  })
  it('Should be able to verify Cluster Creation Completed Successfully', () => {
    // TODO: Remove the hardcoded wait
    cy.wait(240000).then(() => {
      cy.getByTestId('progress-bar-status').each(($el) => {
        const ele1 = ($el as unknown) as string
        cy.get(ele1).contains(/^Completed all [0-9]+ tasks successfully$/)
      })
    })
  })

  after(() => {
    cy.deleteCluster(config.multiMasterClusterData.clusterName)
  })
})

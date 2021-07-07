import 'cypress-wait-until'
import { loadConfig } from 'cypress/support/commands'
import { Config } from 'cypress/support/types'

describe('Cluster upgradation Flow', () => {
  var config: Config
  before(() => {
    config = loadConfig()
    cy.login()
  })

  it('Should be able to upgrade the Cluster', () => {
    // const clusterName = 'SingleMasterCluster-Test-1'
    cy.contains('Infrastructure').click()
    cy.contains('Cluster').click()
    cy.contains(config.singleMasterClusterData.clusterName)
      .parents('tr')
      .children('td')
      .first()
      .click()

    cy.get('div[title="Upgrade Cluster"]').should('be.visible')
    cy.get('div[title="Upgrade Cluster"]').click()
    cy.get('#alert-dialog-title').should('be.visible')
    cy.get('#alert-dialog-title').should('contain.text', 'Upgrade Cluster')
    cy.contains('Confirm').click()
    cy.wait(120000)
    cy.get('p[title="The cluster is upgrading."]').should('contain', 'Upgrading')
  })

  it.skip('Should be able to verfiy that the cluster is upgraded', () => {
    const versionToBeUpdateed = '1.20.5'
    cy.contains('Infrastructure').click()
    cy.contains(config.singleMasterClusterData.clusterName)
      .parents('tr')
      .children('td')
      .find('p')
      .should('contain', versionToBeUpdateed)
  })
})

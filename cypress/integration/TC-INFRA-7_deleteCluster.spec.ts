import 'cypress-wait-until'
import { loadConfig } from 'cypress/support/commands'
import { Config } from 'cypress/support/types'

describe('Delete Cluster Flow', () => {
  var config: Config
  before(() => {
    config=loadConfig()
    cy.login()
  })

  it('should be able to delete a cluster',()=>{
      cy.deleteCluster(config.singleMasterClusterData.clusterName)
  })
})

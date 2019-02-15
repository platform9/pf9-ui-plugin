// TODO: Currently these tests are not idempotent.  When running the tests in watch mode
// within the same simulator instance, nodes will not be available because they have already
// been attached.  We need to have the tests start the simulator and control its state in the
// "before".
describe('clusters', () => {
  beforeEach(() => {
    cy.setSimSession()
  })

  context('list clusters', () => {
    it('lists clusters', () => {
      cy.visit('/ui/kubernetes/clusters')
      cy.contains('fakeCluster1')
    })
  })

  context('cluster details', () => {
    it('allows navigation to the cluster details', () => {
      cy.contains('fakeCluster1').click()
      cy.contains('someCloudProvider')
    })

    it('shows nodes on cluster details', () => {
      cy.contains('Nodes').click()
      cy.contains('Cluster Nodes')
    })
  })

  context('create cluster', () => {
    it('shows the cluster create form', () => {
      cy.visit('/ui/kubernetes/clusters')
      cy.contains('Add').click()
      cy.contains('Add Cluster')
    })
  })

  context('cluster actions', () => {
    context.only('attach node', () => {
      it('shows the modal for adding nodes to the cluster', () => {
        cy.visit('/ui/kubernetes/clusters')
        cy.row('fakeCluster1')
          .rowAction('Attach node')
        cy.contains('Attach Node to Cluster')
      })

      it('selects "master" on the node', () => {
        cy.get('div[role=dialog]').contains('tr', 'fakeNode2').contains('Master').click()
      })

      it('closes the modal on attach', () => {
        cy.contains('button', 'Attach').click()
        cy.contains('Attach Node to Cluster').should('not.exist')
      })

      it('should not allow the node to be added to another cluster', () => {
        cy.row('fakeCluster1')
          .rowAction('Attach node')
        cy.get('div[role=dialog]').contains('fakeNode2').should('not.exist')
      })

      it('should show "No nodes available to attach"', () => {
        cy.contains('No nodes available to attach')
      })

      it('closes the modal on cancel', () => {
        cy.contains('Cancel').click()
        cy.contains('Attach Node to Cluster').should('not.exist')
      })

      it('only allows attaching for "local" cloudProviders', () => {
        cy.row('mockOpenStackCluster').rowAction().contains('Attach node').isDisabled()
        cy.closeModal()
        cy.row('mockAwsCluster').rowAction().contains('Attach node').isDisabled()
        cy.closeModal()
        cy.row('fakeCluster1').rowAction().contains('Attach node').isEnabled()
        cy.closeModal()
      })
    })
  })
})

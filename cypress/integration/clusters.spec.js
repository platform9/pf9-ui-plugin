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
    context('attach node', () => {
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
        // We might want to add something to the UI that gets displayed when
        // the async operation completes so we have a better UX and also so
        // we don't need to wait.
        cy.wait(2000)

        // Reload to the page to get the latest nodes data
        cy.visit('/ui/kubernetes/clusters')
        // TODO: need to update the AppContext with the new cluster <-> association

        cy.row('fakeCluster1')
          .rowAction('Attach node')
        cy.get('div[role=dialog]').contains('fakeNode2').should('not.exist')
      })

      it('should show "No nodes available to attach"', () => {
        cy.visit('/ui/kubernetes/clusters')
        cy.row('fakeCluster1')
          .rowAction('Attach node')
        cy.contains('No nodes available to attach')
      })

      it('closes the modal on cancel', () => {
        cy.row('fakeCluster1')
          .rowAction('Attach node')
        cy.contains('Attach Node to Cluster')
        cy.contains('Cancel').click()
        cy.contains('Attach Node to Cluster').should('not.exist')
      })

      it.only('only allows attaching for "local" cloudProviders', () => {
        cy.visit('/ui/kubernetes/clusters')
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

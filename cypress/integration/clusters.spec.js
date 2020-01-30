describe('clusters', () => {
  beforeEach(() => {
    cy.login()
  })

  context('list clusters', () => {
    it('lists clusters', () => {
      cy.visit('/ui/kubernetes/infrastructure')
      cy.contains('fakeCluster1')
    })
  })

  context('cluster details', () => {
    it('allows navigation to the cluster details', () => {
      cy.contains('fakeCluster1').click()
      cy.contains('someCloudProvider')
    })

    it('shows nodes on cluster details', () => {
      cy.contains('Nodes & Health Info').click()
      cy.contains('Master Nodes')
    })
  })

  context('create cluster', () => {
    it('shows the cluster create form', () => {
      cy.visit('/ui/kubernetes/infrastructure')
      cy.contains('+ Add Cluster').click()
      cy.contains('Select one of the supported Cloud Provider Types:')
      cy.contains('Bare OS').click()
      cy.contains('Add Bare OS Cluster')
    })
  })

  context('cluster actions', () => {
    before(() => {
      cy.resetServerContext('dev')
      cy.login()
    })

    context('scale workers', () => {
      it('shows the page for adding nodes to the cluster', () => {
        cy.visit('/ui/kubernetes/infrastructure')
        cy.row('fakeCluster1').click()
        cy.contains('div', 'Scale workers').click()
        cy.contains('Add').click()
        cy.contains('button', 'Add workers')
      })

      it('selects "fakeNode3" on the node and submits', () => {
        cy.contains('tr', 'fakeNode3').click()
        cy.contains('button', 'Add workers').click()
        cy.contains('Successfully updated Cluster')
      })

      it('should not allow the node to be added to another cluster', () => {
        cy.visit('/ui/kubernetes/infrastructure')
        cy.row('fakeCluster2').click()
        cy.contains('div', 'Scale workers').click()
        cy.contains('Add').click()
      })

      it('should show "There are no nodes available."', () => {
        cy.contains('There are no nodes available.')
      })

      it('closes the modal on cancel', () => {
        cy.get('[title=Cancel]').click()
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

    context('detach node', () => {
      it('only allows detaching for "local" cloudProviders', () => {
        cy.visit('/ui/kubernetes/infrastructure')
        cy.row('mockOpenStackCluster').rowAction().contains('Detach node').isDisabled()
        cy.closeModal()
        cy.row('mockAwsCluster').rowAction().contains('Detach node').isDisabled()
        cy.closeModal()
        cy.row('fakeCluster1').rowAction().contains('Detach node').isEnabled()
        cy.closeModal()
      })

      it('show the modal for detaching nodes from the cluster', () => {
        cy.visit('/ui/kubernetes/infrastructure')
        cy.row('fakeCluster1')
          .rowAction('Detach node')
        cy.contains('Detach node from cluster')
      })

      it('detaches a node', () => {
        cy.get('div[role=dialog]').contains('tr', 'fakeNode1').contains('Detach').click()
      })

      it('closes the modal on detach', () => {
        cy.contains('button', 'Detach nodes').click()
        cy.contains('Detach node from cluster').should('not.exist')
      })

      it('should show "No nodes available to detach" (context updated)', () => {
        cy.row('fakeCluster1')
          .rowAction('Detach node')
        cy.contains('No nodes available to detach')
      })

      it('still shows the node as detached after a page reload (backend data updated)', () => {
        cy.visit('/ui/kubernetes/infrastructure')
        cy.row('fakeCluster1')
          .rowAction('Detach node')
        cy.contains('No nodes available to detach')
      })

      it('closes the modal on cancel', () => {
        cy.contains('Cancel').click()
        cy.contains('Detach node from cluster').should('not.exist')
      })
    })

    context('scale cluster', () => {
      it('only allows scaling for "AWS" cloudProviders', () => {
        cy.visit('/ui/kubernetes/infrastructure')
        cy.row('mockOpenStackCluster').rowAction().contains('Scale cluster').isDisabled()
        cy.closeModal()
        cy.row('mockAwsCluster').rowAction().contains('Scale cluster').isEnabled()
        cy.closeModal()
        cy.row('fakeCluster1').rowAction().contains('Scale cluster').isDisabled()
        cy.closeModal()
      })

      it('show the modal for scaling the cluster', () => {
        cy.row('mockAwsCluster')
          .rowAction('Scale cluster')
        cy.contains('Scale Cluster') // Note we capitalize 'Cluster' to differentiate and have text on the modal
      })

      it('scales a cluster', () => {
        cy.get('#numWorkers input').clear().type('3')
        // cy.get('#enableSpotWorkers input').click()
      })

      it('closes the modal on scale', () => {
        cy.contains('button', 'Scale Cluster').click()
        cy.contains('Scale Cluster').should('not.exist')
      })

      it('should show the cluster with the new number of worker nodes', () => {
        cy.visit('/ui/kubernetes/infrastructure')
        cy.row('mockAwsCluster')
          .rowAction('Scale cluster')
        cy.get('#numWorkers input').should('have.value', '3')
      })

      it('should close the modal when cancelled', () => {
        cy.contains('button', 'Cancel').click()
        cy.contains('Scale Cluster').should('not.exist')
      })
    })
  })
})

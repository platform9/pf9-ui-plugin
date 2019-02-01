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
        cy.tableRowContaining('fakeCluster1')
          .rowAction('Attach node')
        cy.contains('Attach Node to Cluster')
      })

      it('closes the modal on cancel', () => {
        cy.contains('Cancel').click()
        cy.contains('Attach Node to Cluster').should('not.exist')
      })

      it('closes the modal on attach', () => {
        cy.tableRowContaining('fakeCluster1')
          .rowAction('Attach node')
        cy.contains('Attach Node to Cluster')
        cy.contains('button', 'Attach').click()
        cy.contains('Attach Node to Cluster').should('not.exist')
      })
    })
  })
})

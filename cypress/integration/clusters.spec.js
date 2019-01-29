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
})

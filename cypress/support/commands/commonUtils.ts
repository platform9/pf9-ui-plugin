export{}
declare global{

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            login(user:userDetails):void
            minHealthyNodesRequired(nodes: number): Chainable<string>
            deleteCluster(clusterName: string): void
        }
    }
}

/**
 * @description This command is for login user with user details.
 * @param user
 * @returns none
 */
Cypress.Commands.add('login', (user:userDetails) => {
    cy.intercept(/\/qbert\/.*\/v1alpha2\/clusters$/).as('clusters')
    cy.intercept(/\/qbert\/.*\/nodes$/).as('nodes')

    cy.visit('/')
    cy.get('#email').clear().type(user.username)
    cy.get('#password').clear().type(user.password)
    cy.get('span').contains('Sign In').click()

    cy.wait('@clusters', { requestTimeout: 30000, responseTimeout: 30000 })
    cy.wait('@nodes', { requestTimeout: 30000, responseTimeout: 30000 })
    // Validate user Name displayedis as expected
    cy.contains(user.completeName)
})

/**
 * @description This command checks for the min healthy nodes.
 * @param nodes
 * @returns none
 */
 Cypress.Commands.add('minHealthyNodesRequired', (nodes: number) => {
    const minHealthyNodes: number = nodes + 1 // Additional onboarding node
    cy.get('#node-card')
      .find('span.MuiTypography-root.MuiTypography-body1')
      .eq(1)
      .invoke('text')
      .then((nodes) => {
        // Validate node should be greater than equal to minimum healthy nodes.
        cy.wrap(parseInt(nodes)).should('be.gte', minHealthyNodes) 
      })
  })

  /**
 * @description This command does deletes the clusters based on the name
 * @param clusterName
 * @returns none
 */
Cypress.Commands.add('deleteCluster', (clusterName: string) => {
    let clusterCount = 1 
    cy.contains('Dashboard').click()
    cy.get('#cluster-card')
      .find('h1.MuiTypography-root.MuiTypography-h1')
      .invoke('text')
      .then((cluster) => {
        clusterCount = parseInt(cluster) // get the current cluster count
        cy.wrap(clusterCount).should('be.gt', 0)
        cy.contains('Infrastructure').click()
        cy.get('tbody.MuiTableBody-root')
          .find('span.MuiIconButton-label')
          .find('input[type="radio"]')
          .each((radioButton) => { // loop throght all the available clusters
            cy.wrap(radioButton).click()
            cy.contains('Delete').should('be.visible')
            cy.contains('Delete').click()
            cy.get('div[class="MuiDialogContent-root"]')
              .find('b')
              .invoke('text')
              .then((clusterToBeDelete) => {
                // delete the clusters based on provided name
                if (clusterToBeDelete === clusterName) { 
                  cy.get('#clusterName').type(clusterToBeDelete)
                  cy.contains('Delete this cluster').should('be.visible')
                  cy.contains('Delete this cluster').click()
                  cy.wait(10000) // ToDo : Make this wait dynamically for the output.
                } else cy.contains("Don't Delete").click()
              })
          })
      })
  })
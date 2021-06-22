export{}
declare global{

    // eslint-disable-next-line @typescript-eslint/no-namespace
     namespace Cypress {
        interface Chainable {
            deleteCluster(clusterName: string): void
        }
    }
}
 /**
 * @description This command does deletes the clusters based on the name
 * @param clusterName
 * @returns none
 */
Cypress.Commands.add('deleteCluster', (clusterName: string) => {
    let clusterCount = 1 
    cy.contains('Dashboard').click()
    cy.wait(10000)
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

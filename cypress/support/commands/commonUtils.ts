export{}
declare global{

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            login(user:userDetails):void
        }
    }
}

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
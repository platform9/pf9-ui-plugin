import { developmentConfig, testConfig } from "../config"
import { Config, UserDetails } from "../types"

declare global{

    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Cypress {
        interface Chainable {
            login():void
            minHealthyNodesRequired(nodes: number): Chainable<string>
        }
    }
}

/**
 * @description This command is for login user with user details.
 * @param user
 * @returns none
 */
Cypress.Commands.add('login', () => {
    const userCred:UserDetails=loadConfig().loginCredentials
    cy.intercept(/\/qbert\/.*\/v1alpha2\/clusters$/).as('clusters')
    cy.intercept(/\/qbert\/.*\/nodes$/).as('nodes')

    cy.visit('/')
    cy.get('#email').clear().type(userCred.username)
    cy.get('#password').clear().type(userCred.password)
    cy.get('span').contains('Sign In').click()

    cy.wait('@clusters', { requestTimeout: 30000, responseTimeout: 30000 })
    cy.wait('@nodes', { requestTimeout: 30000, responseTimeout: 30000 })
    // Validate user Name displayedis as expected
    cy.contains(userCred.completeName)
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
 * @description Method for loading different Config
 * @returns It returns specific environment Config
 */  
export function loadConfig():Config {
    const env: string = process.env.NODE_ENV
    if(env ==='development'){
       return developmentConfig
    }else if(env==='test'){
        return testConfig
    }
}


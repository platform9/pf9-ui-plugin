const config = require('../../config')

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Allow the session to be stubbed out.
// The hard-coded token id is explicitly whitelisted in the simulator.
// TODO: For true e2e tests we can have this command make actual API calls to login,
// then memoize the result, and set them here.
Cypress.Commands.add('setSimSession', () => {
  const tokenId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  const username = config.simulator.username
  const session = { username, unscopedToken: tokenId }
  window.localStorage.setItem('pf9', JSON.stringify(session))
})

// For use with <ListTable>.  This will select the row containing the given text.
Cypress.Commands.add('tableRowContaining', text => {
  cy.contains(text)
    .parentsUntil('tr').parent()
})

// Once a ListTable row is selected (prevSubject), click the specified row action.
Cypress.Commands.add(
  'rowAction',
  { prevSubject: true },
  (subject, action) => {
    subject.find('button[aria-label="More Actions"]').click()
    cy.get('#more-menu').contains(action).click()
  }
)

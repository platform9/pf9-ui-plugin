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

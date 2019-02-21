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
Cypress.Commands.add('row', text => cy.contains('tr', text))

// Once a ListTable row is selected (prevSubject), click the specified row action.
Cypress.Commands.add(
  'rowAction',
  { prevSubject: true },
  (subject, action) => {
    subject.find('button[aria-label="More Actions"]').click()

    const menu = cy.get('ul[role="menu"]')

    // Allow just the menu to be opened if no action is supplied.
    action && menu.contains(action).click()
    return menu
  }
)

Cypress.Commands.add(
  'isDisabled',
  { prevSubject: 'element' },
  subject => {
    cy.wrap(subject).should($subject => {
      const classNames = $subject.attr('class')
      console.log(classNames)
      expect(classNames).to.contain('disabled')
    })
  }
)

Cypress.Commands.add(
  'isEnabled',
  { prevSubject: 'element' },
  subject => {
    cy.wrap(subject).should($subject => {
      const classNames = $subject.attr('class')
      expect(classNames).not.to.contain('disabled')
    })
  }
)

Cypress.Commands.add(
  'closeModal',
  () => {
    // Click outside the modal to close it
    const selector = 'div[role="presentation"] > [aria-hidden="true"]'
    cy.get(selector).click()
    cy.wait(100) // During development the modal closes before we can see it is even open
    cy.get(selector).should('not.exist') // Wait for the modal to close before proceeding.
  }
)

Cypress.Commands.add(
  'resetServerContext',
  preset => {
    if (preset) {
      cy.request(`${config.apiHost}/admin/preset/${preset}`)
    }
    // Give time for simulator context to be initialized before using the APIs
    cy.wait(200)
  }
)

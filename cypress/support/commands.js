const config = require('../../config')
const name = config.simulator.username
const password = config.simulator.password

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
// Cypress.Commands.add("login", () => { ... })
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
// We put the session variable outside of the command to allow it to be saved for
// subsequent requests and improve performance
let session
Cypress.Commands.add('login', () => {
  if (session) {
    window.localStorage.setItem('pf9', JSON.stringify(session))
    return
  }
  cy.request({
    method: 'POST',
    url: `${config.apiHost}/keystone/v3/auth/tokens?nocatalog`,
    body: {
      auth: {
        identity: {
          methods: ['password'],
          password: {
            user: { name, password, domain: { id: 'default' } },
          },
        },
      },
    },
  })
    .its('body')
    .then(({ token: { id, user } }) => {
      return cy.request({
        method: 'GET',
        url: `${config.apiHost}/keystone/v3/auth/projects`,
        headers: {
          Authorization: `Bearer ${id}`, // required for k8s proxy api
          'X-Auth-Token': id, // required for OpenStack
        },
      }).then(({ body: { projects } }) => {
        session = {
          userTenants: projects,
          tokens: {
            currentToken: id,
            unscopedToken: id,
          },
          user: {
            ...user,
            username: user.name,
            userId: user.id,
            roles: user.roles,
            displayName: user.displayname,
            role: 'admin',
          },
        }
        window.localStorage.setItem('pf9', JSON.stringify(session))
      })
    })
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
  },
)

Cypress.Commands.add(
  'isDisabled',
  { prevSubject: 'element' },
  subject => {
    cy.wrap(subject).should($subject => {
      const classNames = $subject.attr('class')
      expect(classNames).to.contain('disabled')
    })
  },
)

Cypress.Commands.add(
  'isEnabled',
  { prevSubject: 'element' },
  subject => {
    cy.wrap(subject).should($subject => {
      const classNames = $subject.attr('class')
      expect(classNames).not.to.contain('disabled')
    })
  },
)

Cypress.Commands.add(
  'closeModal',
  () => {
    // Click outside the modal to close it
    const selector = 'div[role="presentation"] > [aria-hidden="true"]'
    cy.get(selector).click()
    cy.wait(100) // During development the modal closes before we can see it is even open
    cy.get(selector).should('not.exist') // Wait for the modal to close before proceeding.
  },
)

Cypress.Commands.add(
  'resetServerContext',
  preset => {
    if (preset) {
      cy.request(`${config.apiHost}/admin/preset/${preset}`)
    }
    // Give time for simulator context to be initialized before using the APIs
    cy.wait(200)
  },
)

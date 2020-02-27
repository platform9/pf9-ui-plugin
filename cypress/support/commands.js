const config = require('../../config')

Cypress.Commands.add('login', () => {
  cy.visit('/')
  cy.get('[data-testid=login-email]').type(Cypress.env('userName'))
  cy.get('[data-testid=login-password]').type(Cypress.env('password'))
  cy.get('[data-testid=login-submit-btn]').click()
  // For dev testing it is taking time to login
  cy.wait(5000)
  cy.url().should('include', 'ui/kubernetes/dashboard')
})

// For use with <ListTable>.  This will select the row containing the given text.
Cypress.Commands.add('row', (text) => cy.contains('tr', text))

// Once a ListTable row is selected (prevSubject), click the specified row action.
Cypress.Commands.add('rowAction', { prevSubject: true }, (subject, action) => {
  subject.find('button[aria-label="More Actions"]').click()

  const menu = cy.get('ul[role="menu"]')

  // Allow just the menu to be opened if no action is supplied.
  action && menu.contains(action).click()
  return menu
})

Cypress.Commands.add('isDisabled', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should(($subject) => {
    const classNames = $subject.attr('class')
    expect(classNames).to.contain('disabled')
  })
})

Cypress.Commands.add('isEnabled', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should(($subject) => {
    const classNames = $subject.attr('class')
    expect(classNames).not.to.contain('disabled')
  })
})

Cypress.Commands.add('closeModal', () => {
  // Click outside the modal to close it
  const selector = 'div[role="presentation"] > [aria-hidden="true"]'
  cy.get(selector).click()
  cy.wait(100) // During development the modal closes before we can see it is even open
  cy.get(selector).should('not.exist') // Wait for the modal to close before proceeding.
})

Cypress.Commands.add('resetServerContext', (preset) => {
  if (preset) {
    cy.request(`${config.apiHost}/admin/preset/${preset}`)
  }
  // Give time for simulator context to be initialized before using the APIs
  cy.wait(200)
})

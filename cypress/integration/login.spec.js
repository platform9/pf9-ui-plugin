import config from '../../config'

const signInText = 'Sign In'
const username = 'admin@platform9.com'
const password = 'secret'

describe('login', () => {
  it('reports failed logins', () => {
    cy.visit('/')

    cy.get('#email')
      .type(username)

    cy.get('#password')
      .type('badpassword')

    cy.contains(signInText)
      .click()

    cy.contains('Login failed')
  })

  it('logs in successfully', () => {
    cy.get('#email')
      .clear()
      .type(username)

    cy.get('#password')
      .clear()
      .type(password)

    cy.contains(signInText)
      .click()

    cy.contains(config.region)
  })

  // TODO: this test is not currently working because the localStorage session format has
  // change since we last worked with Cypress tests.  Need to update how we mock out the session.
  it('remembers the login state on refresh', () => {
    cy.login()
    cy.visit('/')
    cy.contains(config.region)
  })
})

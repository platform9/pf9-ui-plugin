import config from '../../config'

const { username, password } = config.simulator

describe('login', () => {
  it('reports failed logins', () => {
    cy.visit('/')

    cy.get('#email')
      .type(username)

    cy.get('#password')
      .type('badpassword')

    cy.contains('SIGN IN')
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

    cy.contains('SIGN IN')
      .click()

    cy.contains('Current Region')
  })

  it('remembers the login state on refresh', () => {
    cy.setSimSession()
    cy.visit('/')
    cy.contains('Current Region')
  })
})

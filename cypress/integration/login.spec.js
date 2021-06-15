import config from '../../config'

const username = config.username
const password = config.password

describe('login', () => {
  it('reports failed logins', () => {
    cy.visit('/')

    cy.get('#email').type(username)

    cy.get('#password').type('badpassword')

    cy.get('#login-submit').click()

    cy.contains('#login-failed')
  })

  it('logs in successfully', () => {
    cy.get('#email')
      .clear()
      .type(username)

    cy.get('#password')
      .clear()
      .type(password)

    cy.get('#login-submit').click()

    cy.contains(config.region)
  })

  it('remembers the login state on refresh', () => {
    cy.login()
    cy.visit('/')
    cy.contains(config.region)
  })
})

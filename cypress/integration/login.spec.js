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
      .should('exist')
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
      .should('exist')
  })

  it('remembers the login state on refresh', () => {
    // TODO: Need to find a way to mock a login.
    // It seems like calls to visit discard all browser state.
    // cy.visit('/')
    // cy.contains('SIGN IN')
    // .should('not.exist')
  })
})

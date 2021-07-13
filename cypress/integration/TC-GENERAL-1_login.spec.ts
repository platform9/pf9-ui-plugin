import { loadConfig } from "cypress/support/commands"

describe('User should be able to login', () => {

  it('should be able to login', () => {
      loadConfig()
      cy.login()
  })
})

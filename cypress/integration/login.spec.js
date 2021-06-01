import config from '../../config'

// const username = config.username
// const password = config.password
const username = 'kingshuk.nandy@afourtech.com'
const password = 'Test@1234'
const region=config.region
describe('login', async () => {
  it('reports failed logins', () => {
    cy.visit('/')

    cy.get('#email').type('username')

    cy.get('#password').type('badpassword')
    
   // cy.get('#login-submit').click()
    cy.get('span').contains('Sign In').click()
    cy.waitFor('#login-failed',2000)
    .then(()=>{
    cy.contains('#login-failed')
    }).catch(error=>{
      console.log(error)
    })
    
  })

  it('logs in successfully', () => {
    cy.get('#email')
      .clear()
      .type(username)

    cy.get('#password')
      .clear()
      .type(password)

   // cy.get('#login-submit').click()
    cy.get('span').contains('Sign In').click()
    cy.wait(5000)
    cy.contains(region)
  })

  it('remembers the login state on refresh', () => {
    cy.login()
    cy.visit('/')
    cy.contains(region)
  })
})

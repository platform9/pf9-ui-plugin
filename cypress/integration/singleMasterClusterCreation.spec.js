// import config from '../../config'
const username = 'kingshuk.nandy@afourtech.com'
const password = 'Test@1234'
const completeName = 'Kingshuk Nandy'
const region = 'RegionOne'
const clusterName = 'SingleMasterCluster-Test-1'
describe('Single Master Cluster Creation', () => {
  it('logs in successfully', () => {
    cy.intercept(/\/qbert\/.*\/services$/).as('services')
    cy.intercept(/\/qbert\/.*\/clusters$/).as('clusters')
    cy.intercept(/\/qbert\/.*\/pods$/).as('pods')
    cy.intercept(/\/qbert\/.*\/deployments$/).as('deployments')

    cy.visit('/')
    cy.get('#email')
      .clear()
      .type(username)

    cy.get('#password')
      .clear()
      .type(password)
    cy.get('span').contains('Sign In').click()

    cy.wait('@services', { requestTimeout: 30000, responseTimeout: 30000 })
    cy.wait('@clusters', { requestTimeout: 30000, responseTimeout: 30000 })
    cy.wait('@pods', { requestTimeout: 30000, responseTimeout: 30000 })
    cy.wait('@deployments', { requestTimeout: 30000, responseTimeout: 30000 })
    cy.contains(completeName)
  })

  it('Should be able to click on AddCluster then SingleMasterCluster', () => {

    cy.get("a[href='/ui/kubernetes/infrastructure/clusters/add']", { timeout: 3000 }).click()
    cy.wait(5000)
    cy.xpath("//span[contains(text(),'Single Master Cluster')]").click()
    cy.wait(3000)
    cy.get('#name').type(clusterName)
    cy.get('label').contains('Kubernetes Version *').click()
    cy.get("li[data-value='1.18.10-pmk.1547']")
    cy.xpath("//span[text()='IPv4']/preceding::input[@type='radio']").should('be.checked')

  })
})
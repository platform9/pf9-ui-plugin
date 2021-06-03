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
    cy.intercept(/\/qbert\/.*\/nodes$/).as('nodes')
    cy.intercept(/\/qbert\/.*\/deployments$/).as('deployments')

    cy.visit('/')
    cy.get('#email')
      .clear()
      .type(username)

    cy.get('#password')
      .clear()
      .type(password)
    cy.get('span').contains('Sign In').click()

    cy.wait(60000)
    // cy.wait('@services', { requestTimeout: 30000, responseTimeout: 30000 })
    cy.wait('@clusters', { requestTimeout: 30000, responseTimeout: 30000 })
    // cy.wait('@pods', { requestTimeout: 30000, responseTimeout: 30000 })
    cy.wait('@nodes', { requestTimeout: 30000, responseTimeout: 30000 })
    // cy.wait('@deployments', { requestTimeout: 30000, responseTimeout: 30000 })
    cy.contains(completeName)
  })

  it('Should be able add cluster of type "SingleMaster"', () => {
    cy.intercept('GET',/\/.*clusters\/supportedRoleVersions$/).as('supportedRoleVersions')
    cy.get("a[href='/ui/kubernetes/infrastructure/clusters/add']", { timeout: 3000 }).click()
    cy.contains('BareOS Virtual Cluster')
    cy.xpath("//span[contains(text(),'Single Master Cluster')]").click()
    cy.wait('@supportedRoleVersions')
    cy.get('#name').type(clusterName)
    cy.get('#kubeRoleVersion').click()
    cy.get("li[data-value='1.18.10-pmk.1547']").click()
    cy.xpath("//span[text()='IPv4']/preceding::input[@type='radio']").should('be.checked')
    cy.contains("Next").click()
  })

  it('Should be able to setup Master Node',()=>{
    cy.contains('Select a node to add as a Master Node')
    cy.get('input:nth-child(1)').click()
    cy.contains("Next").click()
  })
  it('Should be able to setup Worker Nodes',()=>{
    cy.contains('Select nodes to add as Worker Nodes')
    cy.get('input:nth-child(1)').click()
    cy.get('input:nth-child(2)').click()
    cy.contains("Next").click()
  })
  it('Should be able to setup Network',()=>{
    cy.contains('Cluster Networking Range & HTTP Proxy')
    //TODO: Add validations
    cy.contains("Next").click()
  })
  it('Should be able to setup Advanced Configuration',()=>{
    cy.contains('Advanced Configuration')
    //TODO: Add validations
    cy.contains("Next").click()
  })
  it('Should be able to setup Advanced Configuration',()=>{
    cy.contains('Advanced Configuration')
    //TODO: Add validations
    cy.contains("Next").click()
  })
  it('Should be able to review and complete setup of the cluster',()=>{
    cy.contains('Finish and Review')
    //TODO: Add validations
    cy.contains("Next").click()
  })
  it('Should be able to verify Cluster Creation Completed Successfully',()=>{
    cy.contains('Finish and Review')
    //TODO: Add validations
    cy.contains("Next").click()
  })

  
})
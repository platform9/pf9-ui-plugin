import config from '../../config'
const username = 'kingshuk.nandy@afourtech.com'
const password = 'Test@1234'
const region=config.region
const clusterName ='SingleMasterCluster-Test-1'
describe('Single Master Cluster Creation',()=>{
it('logs in successfully', () => {
    cy.visit('/')
    cy.get('#email')
      .clear()
      .type(username)

    cy.get('#password')
      .clear()
      .type(password)

    cy.get('span').contains('Sign In').click()
    cy.contains(region,{timeout: 15000})
  })

    it('Should be able to click on AddCluster then SingleMasterCluster',()=>{
      cy.get("a[href='/ui/kubernetes/infrastructure/clusters/add']", {timeout: 3000}).click()
      cy.wait(15000)
      cy.get("button").contains('Single Master Cluster',{timeout: 3000}).click()
      cy.wait(20000)
      cy.type(clusterName)
      cy.get('label').contains('Kubernetes Version *').click()
      cy.get("li[data-value='1.18.10-pmk.1547']")
      cy.xpath("//span[text()='IPv4']/preceding::input[@type='radio']").should('be.checked')
    })  
})
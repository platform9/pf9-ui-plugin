import 'cypress-wait-until'

const user:userDetails={
  username: 'kingshuk.nandy@afourtech.com',
  password: 'Test@1234',
  completeName: 'Kingshuk Nandy'
}
const clusterName:string = 'OneClickCluster'
describe('Single Master Cluster Creation', () => {
  before(() => {
    cy.login(user)
  })

  it('Should be able add cluster of type "One-Click Cluster"', () => {
    cy.intercept('GET',/\/.*clusters\/supportedRoleVersions$/).as('supportedRoleVersions')
    cy.get("a[href='/ui/kubernetes/infrastructure/clusters/add']", { timeout: 3000 }).click()
    cy.contains('BareOS Virtual Cluster')
    cy.xpath("//span[contains(text(),'One-Click Cluster')]").click()
    cy.wait('@supportedRoleVersions')
    cy.get('#name').type(clusterName)
    cy.get('#kubeRoleVersion').click()
    cy.get("li[data-value='1.18.10-pmk.1547']").click()
  })

  it('Should be able to select a node',()=>{
    var desiredNodeCount=1
    cy.xpath("//tr[@class='MuiTableRow-root']//input[@type='radio']").each(($el)=>{
      $el.click()
      desiredNodeCount--
      if(desiredNodeCount===0) return false 
    })
  })
  it('Should be able to review and complete setup of the cluster',()=>{
    cy.contains("Complete").click()
  })
  it('Should be able to verify Cluster Creation Completed Successfully',()=>{
    
    cy.wait(240000).then(()=>{
          cy.xpath("//article//following-sibling::div/p",{timeout: 60000}).each(($el:string)=>{
          cy.get($el).contains(/^Completed all [0-9]+ tasks successfully$/)
      })
    })

      
    })
  
})
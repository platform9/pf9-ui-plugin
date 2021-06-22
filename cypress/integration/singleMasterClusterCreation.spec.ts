import 'cypress-wait-until'

const user: userDetails = {
  username: 'kingshuk.nandy@afourtech.com',
  password: 'Test@1234',
  completeName: 'Kingshuk Nandy',
}

const clusterName: string = 'SingleMasterCluster-Test-1'

describe('Single Master Cluster Precondition', () => {
  before(() => {
    cy.login(user)
    cy.minHealthyNodesRequired(2)
  })

  it('Should be able add cluster of type "SingleMaster"', () => {
    cy.intercept('GET', /\/.*clusters\/supportedRoleVersions$/).as('supportedRoleVersions')
    cy.get("a[href='/ui/kubernetes/infrastructure/clusters/add']", { timeout: 3000 }).click()
    cy.contains('BareOS Virtual Cluster')
    cy.xpath("//span[contains(text(),'Single Master Cluster')]").click()
    cy.wait('@supportedRoleVersions')
    cy.get('#name').type(clusterName)
    cy.get('#kubeRoleVersion').click()
    cy.get("li[data-value='1.18.10-pmk.1547']").click()
    cy.xpath("//span[text()='IPv4']/preceding::input[@type='radio']").should('be.checked')
    cy.contains('Next').click()
  })

  it('Should be able to setup Master Node', () => {
    cy.contains('Select a node to add as a Master Node')
    cy.xpath("//tr[@class='MuiTableRow-root']//input[@type='radio']")
      .first()
      .click()
    cy.contains('Next').click()
  })
  it('Should be able to setup Worker Nodes', () => {
    cy.contains('Select nodes to add as Worker Nodes')
    var desiredNodeCount = 2
    cy.xpath("//tr[@class='MuiTableRow-root']//input[@type='checkbox']").each(($el: string) => {
      cy.wrap($el).click()
      desiredNodeCount--
      if (desiredNodeCount === 0) return false
      return false
    })
    cy.contains('Next').click()
  })
  it('Should be able to setup Network', () => {
    cy.contains('Cluster Networking Range & HTTP Proxy')
    // TODO: Add validations
    cy.contains('Next').click()
  })
  it('Should be able to setup Advanced Configuration', () => {
    cy.contains('Advanced API Configuration')
    // TODO: Add validations
    cy.contains('Next').click()
  })
  it('Should be able to review and complete setup of the cluster', () => {
    cy.contains('Finish and Review')
    // TODO: Add validations
    cy.contains('Complete').click()
  })
  it('Should be able to verify Cluster Creation Completed Successfully', () => {
    // cy.waitUntil(()=>{
    //     cy.xpath("//article//following-sibling::div/p",{timeout: 60000}).each(($el)=>{
    //         cy.get($el).contains(/^Completed all [0-9]+ tasks successfully$/)
    //     })
    //   })
    cy.wait(240000).then(() => {
      cy.xpath('//article//following-sibling::div/p', { timeout: 60000 }).each(($el) => {
        const ele1 = ($el as unknown) as string
        cy.get(ele1).contains(/^Completed all [0-9]+ tasks successfully$/)
      })
    })
  })

  after(() => {
    cy.deleteCluster(clusterName)
  })
})

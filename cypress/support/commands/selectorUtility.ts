export{}
declare global{

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            getByTestId(testId:string):Chainable<Element>
            getById(id:string):Chainable<Element>
        }
    }
}

Cypress.Commands.add('getByTestId', (testId:string) => cy.get(`[data-testid='${testId}']`))

Cypress.Commands.add('getById', (id:string) => cy.get(`[id='${id}']`))




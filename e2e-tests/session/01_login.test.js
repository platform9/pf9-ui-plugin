import { driver } from '../setup'
import LoginPage from '../page-objects/LoginPage'
import DashboardPage from '../page-objects/DashboardPage'

const config = require('../../config')
const registry = require('../../src/app/utils/registry')

describe('login', () => {
  let loginPage
  beforeAll(async () => {
    loginPage = new LoginPage()
    registry.setupFromConfig(config)
  })

  afterAll(async () => {
    await driver.quit()
  })

  describe('login form', () => {
    describe('without MFA', () => {
      it('should show the login form when there is no session', async () => {
        await loginPage.goto()
        expect(await loginPage.isPresent()).toBe(true)
      })

      it('should show an error when the user uses bad credentials', async () => {
        await loginPage.login('badUsername', 'badPassword')
        const result = await loginPage.getStatus()
        expect(result).toEqual('Login attempt failed.')
      })

      it('should show success when the user uses correct credentials', async () => {
        await loginPage.login(config.username, config.password)
        const result = await loginPage.getStatus()
        expect(result).toEqual('Successfully logged in.')
      })

      it('should redirect to the dashboard when the user enters valid credentials', async () => {
        const dashboardPage = new DashboardPage()
        expect(await dashboardPage.isPresent()).toBe(true)
      })
    })
  })
})

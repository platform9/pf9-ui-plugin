import { navigateTo } from '../setup'
import { waitForClass, waitForId } from '../helpers'

class DashboardPage {
  async goto() {
    await navigateTo('/ui/kubernetes/dashboard')
    this.dashboardPageElement = await waitForClass('dashboard-page')
  }

  async cardsArePresent() {
    try {
      await Promise.all([
        waitForId('user-card'),
        waitForId('tenant-card'),
        waitForId('deployment-card'),
        waitForId('service-card'),
        waitForId('cloud-card'),
        waitForId('pod-card'),
        waitForId('cluster-card'),
        waitForId('node-card'),
      ])

      return true
    } catch (err) {
      return false
    }
  }
}

export default DashboardPage

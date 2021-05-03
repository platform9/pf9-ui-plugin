import { navigateTo } from '../setup'
import { elementByClass, setTextField, waitForClass, elementById } from '../helpers'

class LoginPage {
  async goto() {
    await navigateTo('/')
    this.loginPageElement = await waitForClass('login-page')
  }

  async fillCredentials(username, password) {
    const usernameField = await elementById('email')
    const passwordField = await elementById('password')

    await setTextField(usernameField, username)
    await setTextField(passwordField, password)
  }

  async submit() {
    await elementById('login-submit').click()
  }

  async login(username, password) {
    await this.fillCredentials(username, password)
    await this.submit()
  }

  async getStatus(showProgress = false) {
    // Normally we don't care about seeing the intermediate "Attempting login..."
    if (showProgress) {
      return elementByClass('login-status').getText()
    }
    const status = await waitForClass('login-result')
    return status.getText()
  }

  async getLoginError() {
    return elementById('login-failed').isDisplayed()
  }

  async isPresent() {
    try {
      await waitForClass('login-page')
      return true
    } catch (err) {
      return false
    }
  }
}

export default LoginPage

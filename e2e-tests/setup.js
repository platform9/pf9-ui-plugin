const config = require('../config')
const webdriver = require('selenium-webdriver')

export const browser = new webdriver.Builder().forBrowser('chrome').build()

const { devHost } = config
browser.navigate().to(devHost)

export const navigateTo = (url) => browser.navigate().to(`${devHost}${url}`)

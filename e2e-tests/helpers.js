import { By, until } from 'selenium-webdriver'
import { browser } from './setup'
import { DEFAULT_TIMEOUT } from './constants'

export const waitForClass = (className, timeout = DEFAULT_TIMEOUT) =>
  browser.wait(until.elementLocated(By.className(className)), timeout)

export const waitForId = (className, timeout = DEFAULT_TIMEOUT) =>
  browser.wait(until.elementLocated(By.className(className)), timeout)

export const elementByClass = (className) => browser.findElement(By.className(className))
export const elementById = (id) => browser.findElement(By.id(id))

export const setTextField = async (element, text) => {
  await element.clear()
  await element.sendKeys(text)
}

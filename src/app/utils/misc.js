import { path, equals } from 'ramda'
import moize from 'moize'

// A more resilient JSON parsing that should always return {}
// in error conditions.
export const parseJSON = str => {
  if (typeof str !== 'string') { return {} }
  try {
    const data = JSON.parse(str)
    return data
  } catch (e) {
    console.error('Error parsing JSON', str)
    return {}
  }
}

/**
 * Given a number of seconds returns the number of
 * years, months, days, hours and minutes in a human readable format
 * @param seconds
 * @returns {string}
 */
export const secondsToString = seconds => {
  let remainingSeconds = seconds
  const units = {
    'year': 24 * 60 * 365,
    'month': 24 * 60 * 60 * 30,
    'day': 24 * 60 * 60,
    'hour': 60 * 60,
    'min': 60,
    // 'second': 1,
  }
  const results = []
  for (const unitName in units) {
    const amount = Math.floor(remainingSeconds / units[unitName])
    if (amount === 1) {
      results.push(' ' + amount + ' ' + unitName)
    }
    if (amount >= 2) {
      results.push(' ' + amount + ' ' + unitName + 's')
    }
    remainingSeconds %= units[unitName]
  }
  return results.join(', ')
}

export const isNumeric = n =>
  !Number.isNaN(parseFloat(n)) && Number.isFinite(+n)

export const isPlainObject = obj =>
  Object(obj) === obj && Object.getPrototypeOf(obj) === Object.prototype

const duplicatedSlashesRegexp = new RegExp('(^\\/|[^:\\/]+\\/)\\/+', 'g')

// Given some path segments returns a properly formatted path similarly to Nodejs path.join()
// Remove duplicated slashes
// Does not remove leading/trailing slashes and adds a slash between segments
export const pathJoin = (...pathParts) =>
  [].concat(...pathParts) // Flatten
    .join('/')
    .replace(duplicatedSlashesRegexp, '$1')

export const castFuzzyBool = value => {
  const mappings = {
    // JS performs a narrowing cast of ints, bools, and strings to the same key.
    false: false,
    true: true,
    0: false,
    1: true,
    'False': false,
    'True': true,
  }

  if (mappings[value] !== undefined) { return mappings[value] }
  return false
}

export const columnPathLookup = _path => (_, row) => path(_path.split('.'), row)

export const castBoolToStr = (t = 'yes', f = 'no') => value => value ? t : f

export const tryJsonParse = moize(val => typeof val === 'string' ? JSON.parse(val) : val)

/**
 * Memoizes an async function to prevent the thundering herd problem.
 * This makes duplicate calls (with the same params) return the same promise.
 * @param {function} asyncFn Function that will be memoized until it gets resolved
 * @returns {function}
 */
export const memoizePromise = asyncFn => {
  const memoizedCb = moize(asyncFn, {
    equals, // Use ramda "equals" instead of moize SameValueZero comparisons
    isPromise: true,
  })
  return async (...params) => {
    try {
      const result = await memoizedCb(...params)
      // Clear the memoized cache when the promise is resolved (or rejected), so that all the subsequent calls will return a new promise
      memoizedCb.remove(params)
      return result
    } catch (err) {
      memoizedCb.remove(params)
      throw err
    }
  }
}

/**
 * Utility to prevent React hooks from triggering when passing objects or arrays that
 * really don't change but as they are being generated on every render they trigger an update
 * To archieve so we use ramda "equals" that compares array items and object props instead of just references
 * https://ramdajs.com/docs/#equals
 * @type {function(*): any}
 */
export const memoizedDep = moize(dep => dep, {
  equals,
})

/**
 * Converts a camelCased string to a string with capitalized words separated by spaces
 * @example "camelCasedExampleString" -> "Camel Cased Example String"
 * @param inputStr
 * @returns {string}
 */
export const uncamelizeString = inputStr => inputStr
// insert a space before all caps
  .replace(/([A-Z])/g, ' $1')
  // uppercase the first character
  .replace(/^./, str => str.toUpperCase())

/**
 * Capitalize the first letter of the given string
 * @param inputStr
 * @returns {*}
 */
export const capitalizeString = inputStr => inputStr
// uppercase the first character
  .replace(/^./, str => str.toUpperCase())

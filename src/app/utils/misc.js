import { path, equals } from 'ramda'
import moize from 'moize'
import moment from 'moment'

// Date formatter
export const defaultDateFormat = 'MMM Do YYYY, hh:mm A'
export const formatDate = (ts, format = defaultDateFormat) => moment(ts).format(format)

/**
 * DurationBetweenDates utility function that returns difference between give start and end date
 * into format 'n day(s) n hour(s) n minute(s) depending on respective values.
 * @example ('2020-01-28T00:44:35.000Z', '2020-01-29T01:45:36.000Z') -> '1 day, 1 hour, 1 minute'
 * @param {string} startDateTime
 * @param {string} [endDateTime]
 * @returns {string}
 */
export const durationBetweenDates = (startDateTime, endDateTime = new Date().valueOf()) => {
  const duration = moment.duration(moment(endDateTime).diff(moment(startDateTime)))
  return [
    { fnName: 'months', label: 'month' },
    { fnName: 'days', label: 'day' },
    { fnName: 'hours', label: 'hour' },
    { fnName: 'minutes', label: 'minute' },
  ].reduce((displayStr, curr) => {
    const value = duration[curr.fnName]()
    if (value < 1) {
      return displayStr
    }

    if (displayStr) {
      displayStr += ', '
    }

    const pluralLabel = value > 1 ? 's' : ''

    return `${displayStr}${value} ${curr.label}${pluralLabel}`
  }, '')
}

/**
 * Given a number of seconds returns the number of
 * years, months, days, hours and minutes in a human readable format
 * @param seconds
 * @returns {string}
 */
export const secondsToString = (seconds) => {
  const min = 60
  const hour = min * 60
  const day = hour * 24
  const month = day * 30
  const year = day * 365
  const units = { year, month, day, hour, min }
  let remainingSeconds = seconds
  const results = Object.entries(units).reduce((acc, [unitName, unitSeconds]) => {
    const amount = Math.floor(remainingSeconds / unitSeconds)
    remainingSeconds %= units[unitName]
    if (amount >= 1) {
      return [...acc, `${amount} ${unitName}${amount >= 2 ? 's' : ''}`]
    }
    return acc
  }, [])
  return results.join(', ')
}

// A more resilient JSON parsing that should always return {}
// in error conditions.
export const parseJSON = (str) => {
  if (typeof str !== 'string') {
    return {}
  }
  try {
    const data = JSON.parse(str)
    return data
  } catch (e) {
    console.error('Error parsing JSON', str)
    return {}
  }
}

export const isNumeric = (n) => !Number.isNaN(parseFloat(n)) && Number.isFinite(+n)

export const isPlainObject = (obj) =>
  Object(obj) === obj && Object.getPrototypeOf(obj) === Object.prototype

const duplicatedSlashesRegexp = new RegExp('(^\\/|[^:\\/]+\\/)\\/+', 'g')

// Given some path segments returns a properly formatted path similarly to Nodejs path.join()
// Remove duplicated slashes
// Does not remove leading/trailing slashes and adds a slash between segments
export const pathJoin = (...pathParts) =>
  []
    .concat(...pathParts) // Flatten
    .filter((segment) => !!segment) // Remove empty parts
    .join('/')
    .replace(duplicatedSlashesRegexp, '$1')

export const castFuzzyBool = (value) => {
  const mappings = {
    // JS performs a narrowing cast of ints, bools, and strings to the same key.
    false: false,
    true: true,
    0: false,
    1: true,
    False: false,
    True: true,
  }

  if (mappings[value] !== undefined) {
    return mappings[value]
  }
  return false
}

export const columnPathLookup = (_path) => (_, row) => path(_path.split('.'), row)

export const castBoolToStr = (t = 'Enabled', f = 'Not Enabled') => (value) => (value ? t : f)

export const tryJsonParse = moize((val) => (typeof val === 'string' ? JSON.parse(val) : val))

/**
 * Memoizes an async function to prevent the thundering herd problem.
 * This makes duplicate calls (with the same params) return the same promise.
 * @param {function} asyncFn Function that will be memoized until it gets resolved
 * @returns {function}
 */
export const memoizePromise = (asyncFn) => {
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
export const memoizedDep = moize((dep) => dep, {
  equals,
})

/**
 * Converts a camelCased string to a string with capitalized words separated by spaces
 * @example "camelCasedExampleString" -> "Camel Cased Example String"
 * @param inputStr
 * @returns {string}
 */
export const uncamelizeString = (inputStr) =>
  inputStr
    // insert a space before all caps
    .replace(/([A-Z])/g, ' $1')
    // uppercase the first character
    .replace(/^./, (str) => str.toUpperCase())

/**
 * Capitalize the first letter of the given string
 * @param inputStr
 * @returns {*}
 */
export const capitalizeString = (inputStr) =>
  inputStr
    // uppercase the first character
    .replace(/^./, (str) => str.toUpperCase())

/**
 * Transform a string so that it only has alpha-numeric and hypens.  Useful for FQDN's.
 * @param {string} str
 * @returns {string}
 */
export const sanitizeUrl = (str) =>
  str
    .replace(/[^a-zA-Z0-9-_.]/g, '-') // replace non-valid url characters with hyphen
    .replace(/^-+/, '') // eliminate leading hyphens
    .replace(/\.+$/, '') // eliminate trailing dots

export const getCookieValue = (name) => {
  const val = document.cookie.match('(^|[^;]+)\\s*' + name + '\\s*=\\s*([^;]+)')
  return val ? val.pop() : ''
}

export const normalizeUsername = (name = '') => {
  if (!name) return name

  // split emails from @ sign and take the left hand side
  const [username] = name.split('@')
  return username
}

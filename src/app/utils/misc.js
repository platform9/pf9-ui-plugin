import { path } from 'ramda'

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

export const castBoolToStr = (t='yes', f='no') => value => value ? t : f

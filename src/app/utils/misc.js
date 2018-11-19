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

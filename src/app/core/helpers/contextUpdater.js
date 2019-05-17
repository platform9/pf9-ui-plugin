import { last, assocPath, omit } from 'ramda'
import { ensureArray } from 'utils/fp'
import { getLoader } from 'core/helpers/contextLoader'

/**
 * Returns a function that will be used to add values to existing context arrays
 * @param contextPath Context contextPath
 * @param updaterFn Function whose return value will be used to update the context
 * @param options Additional options ({contextRetriever, returnLast})
 * @returns {Function}
 */
const contextUpdater = (contextPath, updaterFn, options = {}) => {
  const contextPathArr = ensureArray(contextPath)
  const {
    returnLast = false,
  } = options

  return async args => {
    const { getContext, setContext } = args
    const loaderFn = getLoader(contextPathArr)
    const currentItems = (await loaderFn(omit(['params', 'reload', 'cascade'], args))) || []
    const output = await updaterFn({
      ...args,
      apiClient: getContext('apiClient'),
      currentItems,
    })
    await setContext(assocPath(contextPathArr, output))
    return returnLast && Array.isArray(output) ? last(output) : output
  }
}

export default contextUpdater

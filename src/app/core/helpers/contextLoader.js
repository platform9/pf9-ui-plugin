import { path, assocPath, dissocPath } from 'ramda'
import { ensureArray } from 'utils/fp'

let pendingPromises = {}
let resolvers = {}

/**
 * Returns a function that will use context to load and cache values
 * @param contextPath Context path (a string or array for deep paths) on which the resolved value will be cached
 * @param loaderFn Function returning the data to be assigned to the context
 * @param defaultValue Default value assigned to the context
 * @returns {Function}
 */
const contextLoader = (contextPath, loaderFn, defaultValue = []) => {
  const arrContextPath = ensureArray(contextPath)

  const resolver = async ({ getContext, setContext, params = {}, reload = false, cascade = false, nofetch = false, ...rest }) => {
    let promise = path(arrContextPath, pendingPromises)
    if (promise) {
      return promise
    }
    let output = getContext(arrContextPath)

    if ((reload || !output) && !nofetch) {
      if (!output && defaultValue) {
        await setContext(assocPath(arrContextPath, defaultValue))
      }
      const args = {
        context: getContext(),
        getContext,
        setContext,
        apiClient: getContext('apiClient'),
        params,
        reload: reload && cascade,
        cascade,
        loadFromContext: (contextPath, customArgs) =>
          path(ensureArray(contextPath), resolvers)({ ...args, ...customArgs }),
        ...rest,
      }
      promise = loaderFn(args)
      pendingPromises = assocPath(arrContextPath, promise, pendingPromises)
      output = await promise
      await setContext(context => assocPath(arrContextPath, output, context))
      pendingPromises = dissocPath(arrContextPath, pendingPromises)
    }
    return output || defaultValue
  }

  // Store the resolver in an key indexed object that we will use in the exported "getLoader" function
  // "contextUpdater" will make use of resolvers defined using "contextLoader"
  resolvers = assocPath(arrContextPath, resolver, resolvers)
  return resolver
}

export const getLoader = loaderPath => path(loaderPath, resolvers)
export default contextLoader

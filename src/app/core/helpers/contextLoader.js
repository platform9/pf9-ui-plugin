import { path, assocPath, dissocPath } from 'ramda'
import { ensureArray } from 'utils/fp'

let pendingPromises = {}
let resolvers = {}

/**
 * Returns a function that will use context to load and cache values
 * @param contextPath Context path (a string or array for deep paths) on which the resolved value will be cached
 * @param loaderFn Function returning the data to be assigned to the context
 * @param options {contextGetter, contextSetter, defaultValue}
 * @returns {Function}
 */
const contextLoader = (contextPath, loaderFn, options) => {
  const arrContextPath = ensureArray(contextPath)
  const {
    contextGetter = context => path(arrContextPath, context),
    contextSetter = (context, output) => assocPath(arrContextPath, output, context),
    defaultValue = [],
  } = options || {}

  const resolver = async ({ getContext, setContext, reload = false, cascade = false, nofetch = false, ...props }) => {
    let promise = path(arrContextPath, pendingPromises)
    if (promise) {
      return promise
    }
    let output = getContext(ctx => contextGetter(ctx, props))

    if ((reload || !output) && !nofetch) {
      if (!output && defaultValue) {
        await setContext(ctx => contextSetter(ctx, defaultValue, props))
      }
      const args = {
        params: {},
        ...props,
        context: getContext(),
        getContext,
        setContext,
        apiClient: getContext('apiClient'),
        reload: reload && cascade,
        cascade,
        loadFromContext: (contextPath, customArgs) =>
          path(ensureArray(contextPath), resolvers)({ ...args, ...customArgs }),
      }
      promise = loaderFn(args)
      pendingPromises = assocPath(arrContextPath, promise, pendingPromises)
      output = await promise
      await setContext(ctx => contextSetter(ctx, output, props))
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

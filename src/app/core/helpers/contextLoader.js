import { path, assocPath, dissocPath } from 'ramda'
import moize from 'moize'
import { ensureFunction, ensureArray } from 'utils/fp'

let pendingPromises = {}

/**
 * Returns a function that will use context to load and cache values
 * @param pathResolver Context path on which the resolved value will be cached, it can be a function
 * @param loaderFn Function returning the data to be assigned to the context
 * @param defaultValue Default value assigned to the context
 * @returns {Function}
 */
const contextLoader = (pathResolver, loaderFn, defaultValue = []) => {
  const moizedPathResolver = moize(ensureFunction(pathResolver))

  return async ({ context, setContext, params = {}, reload = false, cascade = false, ...rest }) => {
    const resolvedPath = ensureArray(moizedPathResolver(params))
    let promise = path(resolvedPath, pendingPromises)
    if (promise) {
      return promise
    }
    let output = path(resolvedPath, context)

    if (reload || !output) {
      if (!output && defaultValue) {
        await setContext(assocPath(resolvedPath, defaultValue))
      }
      promise = loaderFn({
        context,
        setContext,
        params,
        reload: reload && cascade,
        cascade,
        ...rest,
      })
      console.log(resolvedPath)
      pendingPromises = assocPath(resolvedPath, promise, pendingPromises)
      output = await promise
      await setContext(assocPath(resolvedPath, output))
      dissocPath(resolvedPath, pendingPromises)
    }
    return output
  }
}

export default contextLoader

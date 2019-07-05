import { last, assocPath } from 'ramda'
import { ensureArray } from 'utils/fp'
import { getLoader } from 'core/helpers/contextLoader'

/**
 * Returns a function that will be used to add values to existing context arrays
 * @param contextPath Context contextPath
 * @param updaterFn Function whose return value will be used to update the context
 * @param returnLast Whether or not to return the last value of the updated list
 * @returns {Function}
 */
const contextUpdater = (contextPath, updaterFn, returnLast = false) => {
  const resolvedPath = ensureArray(contextPath)

  return async args => {
    const { getContext, setContext } = args
    const loaderFn = getLoader(resolvedPath)
    const currentItems = (await loaderFn(args)) || []
    const context = getContext()
    const output = await updaterFn({
      ...args,
      apiClient: context.apiClient,
      currentItems,
      loadFromContext: (contextPath, customArgs) =>
        getLoader(contextPath)({ ...args, ...customArgs }),
    })
    await setContext(assocPath(resolvedPath, output))
    return returnLast && Array.isArray(output) ? last(output) : output
  }
}

export default contextUpdater

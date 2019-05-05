import { last, assocPath } from 'ramda'
import { ensureFunction, ensureArray } from 'utils/fp'
import moize from 'moize'

/**
 * Returns a function that will be used to add values to existing context arrays
 * @param pathResolver Context pathResolver
 * @param updaterFn Function whose return value will be used to update the context
 * @param returnLast Whether or not to return the last value of the updated list
 * @returns {Function}
 */
const contextUpdater = (pathResolver, updaterFn, returnLast = false) => {
  const moizedPathResolver = moize(ensureFunction(pathResolver))

  return async ({ context, setContext, params = {}, ...rest }) => {
    const resolvedPath = ensureArray(moizedPathResolver(params))
    const output = await updaterFn({
      context,
      setContext,
      ...rest,
    })
    await setContext(assocPath(resolvedPath, output))
    return returnLast && Array.isArray(output) ? last(output) : output
  }
}

export default contextUpdater

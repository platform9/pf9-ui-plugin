import { last, assocPath } from 'ramda'
import { ensureArray } from 'utils/fp'
import { getLoader } from 'core/helpers/contextLoader'

/**
 * Returns a function that will be used to add values to existing context arrays
 * @param contextPath Context contextPath
 * @param updaterFn Function whose return value will be used to update the context
 * @param options {contextSetter, returnLast}
 * @returns {Function}
 */
const contextUpdater = (contextPath, updaterFn, options) => {
  const arrContextPath = ensureArray(contextPath)
  const {
    contextSetter = (context, output) => assocPath(arrContextPath, output, context),
    returnLast = false,
  } = options || {}

  return async props => {
    const { getContext, setContext } = props
    const loaderFn = getLoader(arrContextPath)
    const currentItems = (await loaderFn(props)) || []
    const context = getContext()
    const output = await updaterFn({
      ...props,
      apiClient: context.apiClient,
      currentItems,
      loadFromContext: (contextPath, customArgs) =>
        getLoader(contextPath)({ ...props, ...customArgs }),
    })
    await setContext(ctx => contextSetter(ctx, output, props))
    return returnLast && Array.isArray(output) ? last(output) : output
  }
}

export default contextUpdater

import { last } from 'ramda'

/**
 * Returns a function that will be used to add values to existing context arrays
 * @param key Context key
 * @param updaterFn Function whose return value will be used to update the context
 * @param returnLast Whether or not to return the last value of the updated list
 * @returns {Function}
 */
const contextUpdater = (key, updaterFn, returnLast = false) =>
  async ({ context, setContext, ...rest }) => {
    const output = await updaterFn({
      context,
      setContext,
      ...rest,
    })
    await setContext({ [key]: output })
    return returnLast && Array.isArray(output) ? last(output) : output
  }

export default contextUpdater

const pendingPromises = {}

/**
 * Returns a function that will use context to load and cache values
 * @param key Context key
 * @param loaderFn Function returning the data to be assigned to the context
 * @param defaultValue Default value assigned to the context
 * @returns {Function}
 */
const contextLoader = (key, loaderFn, defaultValue = []) =>
  async ({ context, setContext, reload = false, cascade = false, ...rest }) => {
    if (pendingPromises[key]) {
      return pendingPromises[key]
    }
    let output = context[key]

    if (reload || !output) {
      pendingPromises[key] = loaderFn({
        context,
        setContext,
        reload: reload && cascade,
        cascade,
        ...rest,
      })
      if (!output && defaultValue) {
        await setContext({ [key]: defaultValue })
      }
      output = await pendingPromises[key]
      await setContext({ [key]: output })
      delete pendingPromises[key]
    }
    return output
  }

export default contextLoader

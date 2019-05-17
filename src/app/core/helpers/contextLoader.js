import {
  path, assocPath, dissocPath, allPass, propSatisfies, whereEq, reject, isEmpty, pick,
  mapObjIndexed, uniqBy,
} from 'ramda'
import { ensureArray, asyncProps } from 'utils/fp'

let pendingPromises = {}
let resolvers = {}

/**
 * Returns a function that will use context to load and cache values
 * @param contextPath Context path (a string or array for deep paths) on which the resolved value will be cached
 * @param loaderFn Function returning the data to be assigned to the context
 * @param options Options ({ indexBy, defaultValue, outputTransformer })
 * @returns {Function}
 */
const contextLoader = (contextPath, loaderFn, options = {}) => {
  const contextPathArr = ensureArray(contextPath)
  const cachedDataKey = 'cachedDataByParams'
  const allKey = '__all__'
  const {
    indexBy = [],
    defaultValue = [],
    preload = {},
    parseParams,
    outputTransformer,
  } = options
  const indexByArr = ensureArray(indexBy)

  const resolver = async ({ getContext, setContext, params = {}, reload = false, cascade = false, ...rest }) => {
    const preArgs = {
      getContext,
      setContext,
      apiClient: getContext('apiClient'),
      reload: reload && cascade,
      cascade,
      ...rest,
    }
    const preloaded = !isEmpty(preload)
      ? await asyncProps(mapObjIndexed(loader => loader(preArgs), preload)) : {}

    const args = {
      ...preArgs,
      preloaded,
      params: parseParams ? parseParams({ preloaded, params }) : params,
    }

    const indexKeyValues = pick(indexByArr, params)
    // The promise path will be unique by every set of params
    const promisePath = [...contextPathArr, JSON.stringify(indexKeyValues)]
    const existingPromise = path(promisePath, pendingPromises)
    if (existingPromise) {
      return existingPromise
    }
    const allCachedItems = getContext(contextPathArr)
    if (!allCachedItems && defaultValue) {
      await setContext(assocPath(contextPathArr, defaultValue))
    }
    // Check all indexed keys to know wether we are trying to retrieve filtered data or everything
    const loadingAll = !indexKeyValues || isEmpty(indexKeyValues) || allPass(
      Object.keys(indexKeyValues).map(key =>
        propSatisfies(val => [allKey, undefined, null].includes(val), key)))(indexKeyValues)

    const indexCacheKey = loadingAll ? allKey : JSON.stringify(indexKeyValues)
    const indexCacheDataPath = [cachedDataKey, ...contextPathArr, indexCacheKey]

    // Check if the filtered values have already been loaded
    const isDataCached = getContext([cachedDataKey, ...contextPathArr, allKey]) ||
      (!loadingAll && getContext(indexCacheDataPath))

    // Filter the retrieved values by the specified param values (eg. clusterId)
    let output = loadingAll ? allCachedItems : allCachedItems.filter(whereEq(indexKeyValues))

    if (reload || !output || !output.length || !isDataCached) {
      // Call loaderFn if no data has been found
      const loaderFnPromise = loaderFn({ ...args })

      pendingPromises = assocPath(promisePath, loaderFnPromise, pendingPromises)
      output = await loaderFnPromise

      await setContext(prevContext => {
        const newContext = assocPath(indexCacheDataPath, true, prevContext)
        if (!loadingAll) {
          const prevItems = reject(whereEq(indexKeyValues), allCachedItems)
          const allItems = uniqBy(pick(indexBy), [...prevItems, ...output])
          return assocPath(contextPathArr, allItems, newContext)
        }
        return assocPath(contextPathArr, output, newContext)
      })
      pendingPromises = dissocPath(promisePath, pendingPromises)
    }
    return outputTransformer && Array.isArray(output)
      ? output.map(outputTransformer)
      : output
  }

  // Store the resolver in a key indexed object that we will use in the exported "getLoader" function
  // "contextUpdater" will make use of resolvers defined using "contextLoader"
  resolvers = assocPath(contextPathArr, resolver, resolvers)
  return resolver
}

export const getLoader = loaderPath => path(loaderPath, resolvers)
export default contextLoader

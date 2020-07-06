import moize from 'moize'
import { pipe, equals, pickAll, reject, either, pathOr, filter, whereEq, isNil } from 'ramda'
import { emptyArr, arrayIfNil, arrayIfEmpty, ensureArray } from 'app/utils/fp'
import { allKey } from 'app/constants'
import { dataStoreKey } from 'core/caching/cacheReducers'

const getDataSelector = moize(
  (dataKey, indexBy = []) => {
    return (store, params) => {
      const providedIndexedParams = pipe(
        pickAll(ensureArray(indexBy)),
        reject(either(isNil, equals(allKey))),
      )(params || {})
      return pipe(
        pathOr(emptyArr, [dataStoreKey, dataKey]),
        arrayIfNil,
        // Filter the data by the provided params
        // @ts-ignore
        filter(whereEq(providedIndexedParams)),
        // Return the constant emptyArr to avoid unnecessary re-renderings
        arrayIfEmpty,
      )(store)
    }
  },
  { equals },
)

export default getDataSelector

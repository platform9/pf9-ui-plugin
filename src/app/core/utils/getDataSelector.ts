import {
  Dictionary,
  either,
  equals,
  find,
  isEmpty,
  isNil,
  pathOr,
  pickAll,
  pipe,
  reject,
  whereEq,
} from 'ramda'
import {
  arrayIfEmpty,
  arrayIfNil,
  emptyArr,
  ensureArray,
  isNilOrEmpty,
  emptyObj,
  filterIf,
} from 'app/utils/fp'
import { allKey } from 'app/constants'
import { cacheStoreKey, dataStoreKey, paramsStoreKey } from 'core/caching/cacheReducers'
import { GlobalState, IDataKeys } from 'k8s/datakeys.model'
import { createSelector } from 'reselect'
import { memoizedDep } from 'utils/misc'

const getDataSelector = <T extends keyof IDataKeys>(
  dataKey: T,
  indexBy: string[] | string = [],
) => {
  return createSelector<
    GlobalState,
    Dictionary<any>,
    IDataKeys[T],
    Readonly<any[]>,
    Dictionary<any>,
    IDataKeys[T]
  >(
    [
      pathOr(emptyArr, [cacheStoreKey, dataStoreKey, dataKey]),
      pathOr(emptyArr, [cacheStoreKey, paramsStoreKey, dataKey]),
      (_, params): Dictionary<any> => memoizedDep(params),
    ],
    (storeData, storeParams, params) => {
      const providedIndexedParams = pipe<
        Dictionary<string | number>,
        Dictionary<string | number>,
        Dictionary<string | number>
      >(
        pickAll(ensureArray(indexBy)),
        reject(either(isNil, equals(allKey))),
      )(params || emptyObj)

      // If the provided params are already cached
      if (isNilOrEmpty(indexBy) || find(whereEq(providedIndexedParams), storeParams)) {
        // Return the cached data filtering by the provided params
        return pipe<IDataKeys[T] | [], IDataKeys[T] | [], IDataKeys[T] | [], IDataKeys[T] | []>(
          arrayIfNil,
          // Filter the data by the provided params
          // @ts-ignore
          filterIf(!isEmpty(providedIndexedParams), whereEq(providedIndexedParams)),
          // Return the constant emptyArr to avoid unnecessary re-renderings
          arrayIfEmpty,
        )(storeData)
      }
      return emptyArr
    },
  )
}

export default getDataSelector

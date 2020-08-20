import { pipe, equals, pickAll, reject, either, pathOr, filter, whereEq, isNil } from 'ramda'
import { emptyArr, arrayIfNil, arrayIfEmpty, ensureArray } from 'app/utils/fp'
import { allKey } from 'app/constants'
import { dataStoreKey } from 'core/caching/cacheReducers'
import { IDataKeys } from 'k8s/datakeys.model'
import { ParametricSelector } from 'reselect'

const getDataSelector = <T extends keyof IDataKeys>(
  dataKey: T,
  indexBy: string[] | string = [],
): ParametricSelector<IDataKeys, any, IDataKeys[T]> => {
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
}

export default getDataSelector

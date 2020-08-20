import {
  pipe,
  equals,
  pickAll,
  reject,
  either,
  pathOr,
  filter,
  whereEq,
  isNil,
  Dictionary,
} from 'ramda'
import { emptyArr, arrayIfNil, arrayIfEmpty, ensureArray } from 'app/utils/fp'
import { allKey } from 'app/constants'
import { dataStoreKey } from 'core/caching/cacheReducers'
import { IDataKeys, GlobalState } from 'k8s/datakeys.model'
import { Selector } from 'reselect'

const getDataSelector = <T extends keyof IDataKeys>(
  dataKey: T,
  indexBy: string[] | string = [],
): Selector<GlobalState, IDataKeys[T]> => {
  const selector: any = (store, params) => {
    const providedIndexedParams = pipe<
      Dictionary<string | number>,
      Dictionary<string | number>,
      Dictionary<string | number>
    >(
      pickAll(ensureArray(indexBy)),
      reject(either(isNil, equals(allKey))),
    )(params || {})
    return pipe<
      GlobalState,
      IDataKeys[T] | [],
      IDataKeys[T] | [],
      IDataKeys[T] | [],
      IDataKeys[T] | []
    >(
      pathOr(emptyArr, [dataStoreKey, dataKey]),
      arrayIfNil,
      // Filter the data by the provided params
      // @ts-ignore
      filter(whereEq(providedIndexedParams)),
      // Return the constant emptyArr to avoid unnecessary re-renderings
      arrayIfEmpty,
    )(store)
  }
  return selector
}

export default getDataSelector

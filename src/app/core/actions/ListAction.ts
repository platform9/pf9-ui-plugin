import { IDataKeys } from 'k8s/datakeys.model'
import {
  Dictionary,
  either,
  equals,
  isNil,
  mergeLeft,
  pick,
  pickAll,
  pipe,
  reject,
  values,
} from 'ramda'
import Action from 'core/actions/Action'
import store from 'app/store'
import { emptyArr, ensureArray } from 'utils/fp'
import { allKey, defaultUniqueIdentifier } from 'app/constants'
import { cacheActions } from 'core/caching/cacheReducers'

class ListAction<
  D extends keyof IDataKeys,
  P extends Dictionary<any> = {},
  R extends any[] = IDataKeys[D]
> extends Action<D, P, R> {
  public get name() {
    return 'list'
  }

  public get defaultResult(): R {
    return [] as R
  }

  protected validateParams = (params: P): boolean => {
    const { indexBy = emptyArr } = this.config
    const allIndexKeys = indexBy ? ensureArray(indexBy) : emptyArr

    // Get the required values from the provided params
    const providedRequiredParams = pipe(pick(allIndexKeys), reject(isNil))(params)

    // If not all the required params are provided, skip this request and just return an empty array
    return !(indexBy && values(providedRequiredParams).length < allIndexKeys.length)
  }

  protected postProcess = (result: R, params: P) => {
    const {
      cacheKey,
      uniqueIdentifier = defaultUniqueIdentifier,
      indexBy = emptyArr,
      cache = true,
    } = this.config
    const { refetch = false } = params
    const allIndexKeys = indexBy ? ensureArray(indexBy) : emptyArr

    const { dispatch } = store

    // Get the required values from the provided params
    const providedRequiredParams = pipe(pick(allIndexKeys), reject(isNil))(params)
    // If not all the required params are provided, skip this request and just return an empty array
    if (indexBy && values(providedRequiredParams).length < allIndexKeys.length) {
      return
    }

    const providedIndexedParams = pipe(
      pickAll(allIndexKeys),
      reject(either(isNil, equals(allKey))),
    )(params)

    // We can't rely on the server to index the data, as sometimes it simply doesn't return the
    // params used for the query, so we will add them to the items in order to be able to find
    // them afterwards
    const itemsWithParams =
      result instanceof Array ? result.map(mergeLeft(providedIndexedParams)) : result

    // Perfom the cache update operations
    if (!cache || refetch) {
      dispatch(
        cacheActions.replaceAll({
          cacheKey,
          items: itemsWithParams,
          params: cache ? providedIndexedParams : null,
        }),
      )
    } else {
      dispatch(
        cacheActions.upsertAll({
          uniqueIdentifier,
          cacheKey,
          items: itemsWithParams,
          params: providedIndexedParams,
        }),
      )
    }
  }
}

export default ListAction

import { IDataKeys } from 'k8s/datakeys.model'
import {
  __,
  allPass,
  append,
  assocPath,
  Dictionary,
  find,
  identity,
  isNil,
  lensPath,
  map,
  mergeLeft,
  of,
  over,
  path,
  pathEq,
  pipe,
  split,
  when,
  dissocPath,
} from 'ramda'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  adjustWith,
  arrayIfNil,
  emptyArr,
  ensureArray,
  pathStr,
  removeWith,
  upsertAllBy,
} from 'utils/fp'
import { defaultUniqueIdentifier } from 'app/constants'
import { isEqual } from 'lodash'

export const paramsStoreKey = 'cachedParams'
export const dataStoreKey = 'cachedData'
export const loadingStoreKey = 'loadingData'

type ParamsType = Dictionary<any>
type Optional<T> = T extends null ? void : T

export interface CacheState {
  [dataStoreKey]: any[]
  [paramsStoreKey]: ParamsType[]
  [loadingStoreKey]: Dictionary<boolean>
}

export const initialState: CacheState = {
  [dataStoreKey]: [],
  [paramsStoreKey]: [],
  [loadingStoreKey]: {},
}

const getIdentifiersMatcher = (uniqueIdentifier: string | string[], params: ParamsType) => {
  const uniqueIdentifierPaths = uniqueIdentifier
    ? ensureArray(uniqueIdentifier).map(split('.'))
    : emptyArr
  const matchIdentifier = (idPath) => pathEq(idPath, path(idPath, params))
  return allPass(map(matchIdentifier, uniqueIdentifierPaths))
}

const reducers = {
  setLoading: <D extends keyof IDataKeys>(
    state,
    {
      payload: { cacheKey, loading },
    }: PayloadAction<{
      cacheKey: D
      loading: boolean
    }>,
  ) => assocPath([loadingStoreKey, cacheKey], loading, state),
  addItem: <D extends keyof IDataKeys, T extends Dictionary<any>>(
    state,
    {
      payload: { cacheKey, params, item },
    }: PayloadAction<{
      cacheKey: D
      params: ParamsType
      item: T
    }>,
  ) => {
    const dataLens = lensPath([dataStoreKey, cacheKey])

    return over(dataLens, append(mergeLeft(params, item)))(state)
  },
  updateItem: <D extends keyof IDataKeys, T extends Dictionary<any>>(
    state,
    {
      payload: { uniqueIdentifier = defaultUniqueIdentifier, cacheKey, params, item },
    }: PayloadAction<{
      uniqueIdentifier?: string | string[]
      params: ParamsType
      cacheKey: D
      item: T
    }>,
  ) => {
    const dataLens = lensPath([dataStoreKey, cacheKey])
    const matchIdentifiers = getIdentifiersMatcher(uniqueIdentifier, params)

    // TODO: fix adjustWith typings
    return over(
      dataLens,
      // @ts-ignore
      adjustWith(matchIdentifiers, mergeLeft(item)),
    )(state)
  },
  removeItem: <D extends keyof IDataKeys>(
    state,
    {
      payload: { uniqueIdentifier, cacheKey, params },
    }: PayloadAction<{ uniqueIdentifier: string | string[]; params: ParamsType; cacheKey: D }>,
  ) => {
    const dataLens = lensPath([dataStoreKey, cacheKey])
    const matchIdentifiers = getIdentifiersMatcher(uniqueIdentifier, params)

    // TODO: fix removeWith typings
    return over(
      dataLens,
      // @ts-ignore
      removeWith(matchIdentifiers),
    )(state)
  },
  upsertAll: <D extends keyof IDataKeys, T extends Dictionary<any>>(
    state,
    {
      payload: { uniqueIdentifier = defaultUniqueIdentifier, cacheKey, params, items },
    }: PayloadAction<{
      uniqueIdentifier?: string | string[]
      cacheKey: D
      params?: ParamsType
      items: T[]
    }>,
  ) => {
    const dataLens = lensPath([dataStoreKey, cacheKey])
    const paramsLens = lensPath([paramsStoreKey, cacheKey])
    const uniqueIdentifierStrPaths = uniqueIdentifier ? ensureArray(uniqueIdentifier) : emptyArr

    // Insert or update the existing items (using `uniqueIdentifier` to prevent duplicates)
    const matchUniqueIdentifiers = (item) => map(pathStr(__, item), uniqueIdentifierStrPaths)

    // @ts-ignore
    const upsertNewItems = pipe(arrayIfNil, upsertAllBy(matchUniqueIdentifiers, items))

    return pipe(
      over(dataLens, upsertNewItems),
      // I params are provided, add them to cachedParams so that
      // we know this query has already been resolved
      over(
        paramsLens,
        params
          ? pipe(
              arrayIfNil,
              when(
                pipe(
                  find((item) => isEqual(item, params)),
                  isNil,
                ),
                append(params),
              ),
            )
          : identity,
      ),
    )(state)
  },
  replaceAll: <D extends keyof IDataKeys, T extends Dictionary<any>>(
    state,
    {
      payload: { cacheKey, params, items },
    }: PayloadAction<{ cacheKey: D; params?: ParamsType; items: T[] }>,
  ) => {
    const dataPath = [dataStoreKey, cacheKey]
    const paramsPath = [paramsStoreKey, cacheKey]

    return pipe<CacheState, CacheState, CacheState>(
      assocPath(dataPath, items),
      // If params are provided, replace the cached params array with the new params
      params ? assocPath(paramsPath, of(params)) : identity,
    )(state)
  },
  clearCache: <D extends keyof IDataKeys>(
    state,
    action?: PayloadAction<Optional<{ cacheKey: D }>>,
  ) => {
    const cacheKey = action?.payload?.cacheKey
    return cacheKey
      ? pipe<CacheState, CacheState, CacheState, CacheState>(
          dissocPath([dataStoreKey, cacheKey]),
          dissocPath([paramsStoreKey, cacheKey]),
          dissocPath([loadingStoreKey, cacheKey]),
        )(state)
      : initialState
  },
}

const { name: cacheStoreKey, reducer: cacheReducers, actions: cacheActions } = createSlice({
  name: 'cache',
  initialState,
  reducers,
})

export { cacheStoreKey, cacheActions }
export default cacheReducers

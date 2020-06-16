import {
  __,
  assocPath,
  pathEq,
  over,
  append,
  lensPath,
  pipe,
  mergeLeft,
  allPass,
  map,
  path,
  split,
  of,
  identity,
  Dictionary,
} from 'ramda'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  arrayIfNil,
  upsertAllBy,
  ensureArray,
  pathStr,
  emptyArr,
  adjustWith,
  removeWith,
} from 'utils/fp'
import { defaultUniqueIdentifier } from 'app/constants'

export const paramsStoreKey = 'cachedParams'
export const dataStoreKey = 'cachedData'
export const loadingStoreKey = 'loadingData'

type ParamsType = Array<{ [key: string]: number | string }>
type Optional<T> = T extends null ? void : T

export interface CacheState {
  [dataStoreKey]: any[]
  [paramsStoreKey]: ParamsType
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
  setLoading: (
    state,
    {
      payload: { cacheKey, loading },
    }: PayloadAction<{
      uniqueIdentifier: string | string[]
      cacheKey: string
      loading: boolean
    }>,
  ) => assocPath([loadingStoreKey, cacheKey], loading, state),
  addItem: <T extends Dictionary<any>>(
    state,
    {
      payload: { cacheKey, params, item },
    }: PayloadAction<{
      uniqueIdentifier: string | string[]
      cacheKey: string
      params: ParamsType
      item: T
    }>,
  ) => {
    const dataLens = lensPath([dataStoreKey, cacheKey])

    return over(dataLens, append(mergeLeft(params, item)))(state)
  },
  updateItem: <T extends Dictionary<any>>(
    state,
    {
      payload: { uniqueIdentifier = defaultUniqueIdentifier, cacheKey, params, item },
    }: PayloadAction<{
      uniqueIdentifier: string | string[]
      params: ParamsType
      cacheKey: string
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
  removeItem: (
    state,
    {
      payload: { uniqueIdentifier, cacheKey, params },
    }: PayloadAction<{ uniqueIdentifier: string | string[]; params: ParamsType; cacheKey: string }>,
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
  upsertAll: <T extends Dictionary<any>>(
    state,
    {
      payload: { uniqueIdentifier = defaultUniqueIdentifier, cacheKey, params, items },
    }: PayloadAction<{
      uniqueIdentifier: string | string[]
      cacheKey: string
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
      over(paramsLens, params ? pipe(arrayIfNil, append(params)) : identity),
    )(state)
  },
  replaceAll: <T extends Dictionary<any>>(
    state,
    {
      payload: { cacheKey, params, items },
    }: PayloadAction<{ cacheKey: string; params?: ParamsType; items: T[] }>,
  ) => {
    const dataPath = [dataStoreKey, cacheKey]
    const paramsPath = [paramsStoreKey, cacheKey]

    return pipe<CacheState, CacheState, CacheState>(
      assocPath(dataPath, items),
      // If params are provided, replace the cached params array with the new params
      params ? assocPath(paramsPath, of(params)) : identity,
    )(state)
  },
  clearCache: (state, action?: PayloadAction<Optional<{ cacheKey: string }>>) => {
    const cacheKey = action?.payload?.cacheKey
    return cacheKey
      ? pipe<CacheState, CacheState, CacheState>(
          assocPath([dataStoreKey, cacheKey], emptyArr),
          assocPath([paramsStoreKey, cacheKey], emptyArr),
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

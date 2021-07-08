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
  find,
  when,
  isNil,
  dissocPath,
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
import DataKeys from 'k8s/DataKeys'
import { isEqual } from 'lodash'

export const paramsStoreKey = 'cachedParams'
export const dataStoreKey = 'cachedData'
export const loadingStoreKey = 'loadingData'
export const updatingStoreKey = 'updatingData'

type ParamsType = Array<{ [key: string]: number | string }>
type Optional<T> = T extends null ? void : T

export interface CacheState {
  [dataStoreKey]: any[]
  [paramsStoreKey]: ParamsType
  [loadingStoreKey]: Dictionary<boolean>
  [updatingStoreKey]: Dictionary<boolean>
}

export const initialState: CacheState = {
  [dataStoreKey]: [],
  [paramsStoreKey]: [],
  [loadingStoreKey]: {},
  [updatingStoreKey]: {},
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
      cacheKey: DataKeys
      loading: boolean
    }>,
  ) => {
    const name = `cacheReducers/setLoading/${cacheKey}`
    console.time(name)
    console.count(name)
    const result = assocPath([loadingStoreKey, cacheKey], loading, state)
    console.timeEnd(name)
    return result
  },
  setUpdating: (
    state,
    {
      payload: { cacheKey, updating },
    }: PayloadAction<{
      cacheKey: DataKeys
      updating: boolean
    }>,
  ) => {
    const name = `cacheReducers/setUpdating/${cacheKey}`
    console.time(name)
    console.count(name)
    const result = assocPath([updatingStoreKey, cacheKey], updating, state)
    console.timeEnd(name)
    return result
  },
  addItem: <T extends Dictionary<any>>(
    state,
    {
      payload: { cacheKey, params, item },
    }: PayloadAction<{
      uniqueIdentifier: string | string[]
      cacheKey: DataKeys
      params: ParamsType
      item: T
    }>,
  ) => {
    const name = `cacheReducers/addItem/${cacheKey}`
    console.time(name)
    console.count(name)
    const dataLens = lensPath([dataStoreKey, cacheKey])
    const result = over(dataLens, append(mergeLeft(params, item)))(state)
    console.timeEnd(name)
    return result
  },
  updateItem: <T extends Dictionary<any>>(
    state,
    {
      payload: { uniqueIdentifier = defaultUniqueIdentifier, cacheKey, params, item },
    }: PayloadAction<{
      uniqueIdentifier: string | string[]
      params: ParamsType
      cacheKey: DataKeys
      item: T
    }>,
  ) => {
    const name = `cacheReducers/updateItem/${cacheKey}`
    console.time(name)
    console.count(name)
    const dataLens = lensPath([dataStoreKey, cacheKey])
    const matchIdentifiers = getIdentifiersMatcher(uniqueIdentifier, params)

    // TODO: fix adjustWith typings
    const result = over(
      dataLens,
      // @ts-ignore
      adjustWith(matchIdentifiers, mergeLeft(item)),
    )(state)
    console.timeEnd(name)
    return result
  },
  removeItem: (
    state,
    {
      payload: { uniqueIdentifier, cacheKey, params },
    }: PayloadAction<{ uniqueIdentifier: string | string[]; params: ParamsType; cacheKey: string }>,
  ) => {
    const name = `cacheReducers/removeItem/${cacheKey}`
    console.time(name)
    console.count(name)

    const dataLens = lensPath([dataStoreKey, cacheKey])
    const matchIdentifiers = getIdentifiersMatcher(uniqueIdentifier, params)

    // TODO: fix removeWith typings
    const result = over(
      dataLens,
      // @ts-ignore
      removeWith(matchIdentifiers),
    )(state)
    console.timeEnd(name)
    return result
  },
  upsertAll: <T extends Dictionary<any>>(
    state,
    {
      payload: { uniqueIdentifier = defaultUniqueIdentifier, cacheKey, params, items },
    }: PayloadAction<{
      uniqueIdentifier: string | string[]
      cacheKey: DataKeys
      params?: ParamsType
      items: T[]
    }>,
  ) => {
    const name = `cacheReducers/upsertAll/${cacheKey}`
    console.time(name)
    console.count(name)

    const dataLens = lensPath([dataStoreKey, cacheKey])
    const paramsLens = lensPath([paramsStoreKey, cacheKey])
    const uniqueIdentifierStrPaths = uniqueIdentifier ? ensureArray(uniqueIdentifier) : emptyArr

    // Insert or update the existing items (using `uniqueIdentifier` to prevent duplicates)
    const matchUniqueIdentifiers = (item) => map(pathStr(__, item), uniqueIdentifierStrPaths)

    // @ts-ignore
    const upsertNewItems = pipe(arrayIfNil, upsertAllBy(matchUniqueIdentifiers, items))

    const result = pipe(
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
    console.timeEnd(name)
    return result
  },
  replaceAll: <T extends Dictionary<any>>(
    state,
    {
      payload: { cacheKey, params, items },
    }: PayloadAction<{ cacheKey: string; params?: ParamsType; items: T[] }>,
  ) => {
    const name = `cacheReducers/replaceAll/${cacheKey}`
    console.time(name)
    console.count(name)

    const dataPath = [dataStoreKey, cacheKey]
    const paramsPath = [paramsStoreKey, cacheKey]

    const result = pipe<CacheState, CacheState, CacheState>(
      assocPath(dataPath, items),
      // If params are provided, replace the cached params array with the new params
      params ? assocPath(paramsPath, of(params)) : identity,
    )(state)
    console.timeEnd(name)
    return result
  },
  clearCache: (state, action?: PayloadAction<Optional<{ cacheKey: DataKeys }>>) => {
    const cacheKey = action?.payload?.cacheKey
    if (!cacheKey) return initialState
    const name = `cacheReducers/clearCache/${cacheKey}`
    console.time(name)
    console.count(name)

    const result = pipe<CacheState, CacheState, CacheState, CacheState>(
      dissocPath([dataStoreKey, cacheKey]),
      dissocPath([paramsStoreKey, cacheKey]),
      dissocPath([loadingStoreKey, cacheKey]),
    )(state)
    console.timeEnd(name)
    return result
  },
}

const { name: cacheStoreKey, reducer: cacheReducers, actions: cacheActions } = createSlice({
  name: 'cache',
  initialState,
  reducers,
})

export { cacheStoreKey, cacheActions }
export default cacheReducers

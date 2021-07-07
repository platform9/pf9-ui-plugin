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
    console.count(`cacheReducers/setLoading/${cacheKey}`)
    return assocPath([loadingStoreKey, cacheKey], loading, state)
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
    console.count(`cacheReducers/setUpdating/${cacheKey}`)
    return assocPath([updatingStoreKey, cacheKey], updating, state)
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
    console.count(`cacheReducers/addItem/${cacheKey}`)
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
      cacheKey: DataKeys
      item: T
    }>,
  ) => {
    console.count(`cacheReducers/updateItem/${cacheKey}`)
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
    console.count(`cacheReducers/removeItem/${cacheKey}`)
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
      cacheKey: DataKeys
      params?: ParamsType
      items: T[]
    }>,
  ) => {
    console.count(`cacheReducers/upsertAll/${cacheKey}`)
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
  replaceAll: <T extends Dictionary<any>>(
    state,
    {
      payload: { cacheKey, params, items },
    }: PayloadAction<{ cacheKey: string; params?: ParamsType; items: T[] }>,
  ) => {
    console.count(`cacheReducers/replaceAll/${cacheKey}`)
    const dataPath = [dataStoreKey, cacheKey]
    const paramsPath = [paramsStoreKey, cacheKey]

    return pipe<CacheState, CacheState, CacheState>(
      assocPath(dataPath, items),
      // If params are provided, replace the cached params array with the new params
      params ? assocPath(paramsPath, of(params)) : identity,
    )(state)
  },
  clearCache: (state, action?: PayloadAction<Optional<{ cacheKey: DataKeys }>>) => {
    const cacheKey = action?.payload?.cacheKey
    console.count(`cacheReducers/clearCache/${cacheKey}`)
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

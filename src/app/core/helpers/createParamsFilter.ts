import {
  pipe,
  pickAll,
  reject,
  either,
  isNil,
  equals,
  filter,
  whereEq,
  curry,
  Dictionary,
} from 'ramda'
import { allKey } from 'app/constants'
import { arrayIfEmpty } from 'utils/fp'

const createParamsFilter = curry(
  (keys: string[], params: Dictionary<number | string>) => {
    const providedIndexedParams = pipe(
      pickAll(keys),
      reject(either(isNil, equals(allKey))),
    )(params)

    return pipe(
      // Filter the data by the provided params
      // @ts-ignore
      filter(whereEq(providedIndexedParams)),
      // Return the constant emptyArr to avoid unnecessary re-renderings
      arrayIfEmpty,
    )
  }
)

export default createParamsFilter

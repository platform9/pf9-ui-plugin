import moize from 'moize'
import { pipe, sortBy, when, is, identity, reverse, toLower } from 'ramda'
import { stringIfNil, pathStr } from 'utils/fp'
import { defaultUniqueIdentifier } from 'app/constants'

export enum OrderDirection {
  asc = 'asc',
  desc = 'desc',
}
type OrderDirectionString = keyof typeof OrderDirection

interface SortConfig {
  orderBy?: string
  orderDirection?: OrderDirection | OrderDirectionString
}

// TODO improve this generic sorting function to take into account more
// types of data (eg dates, numbers, etc) and custom sorting functions
const createSorter = moize.deep((config: SortConfig) => {
  const { orderBy = defaultUniqueIdentifier, orderDirection = 'asc' } = config
  const sortFn = sortBy(pipe(pathStr(orderBy), stringIfNil, when(is(String), toLower)))
  const directionFn = orderDirection === 'asc' ? identity : reverse

  return pipe(sortFn, directionFn)
})

export default createSorter

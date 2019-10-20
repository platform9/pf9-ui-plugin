import { curry, filter, evolve, add } from 'ramda'
import { pathStrOr } from 'utils/fp'

const calcUsageTotals = curry((items, currentPathStr, maxPathStr) => {
  const getCurrentValue = typeof currentPathStr === 'string'
    ? pathStrOr(0, currentPathStr)
    : currentPathStr
  const getMaxValue = typeof maxPathStr === 'string'
    ? pathStrOr(0, maxPathStr)
    : maxPathStr
  // Make sure max value is never 0 to prevent division by zero
  const isItemActive = item => !!getMaxValue(item)
  const activeItemsCount = filter(isItemActive, items).length
  const calcUsagePercent = (item) =>
    getMaxValue(item) && activeItemsCount
      ? 100 * getCurrentValue(item) / getMaxValue(item) / activeItemsCount
      : 0
  const specReducer = (accumulatedTotals, item) => evolve({
    current: add(getCurrentValue(item)),
    max: add(getMaxValue(item)),
    percent: add(calcUsagePercent(item)),
  }, accumulatedTotals)

  return items.reduce(specReducer, {
    current: 0,
    max: 0,
    percent: 0,
  })
})

export default calcUsageTotals

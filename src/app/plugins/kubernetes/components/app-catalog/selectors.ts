import { createSelector } from 'reselect'
import { mergeLeft, pipe } from 'ramda'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import createSorter from 'core/helpers/createSorter'

export const appsSelector = createSelector(
  [getDataSelector<DataKeys.Apps>(DataKeys.Apps)],
  (rawApps) => {
    return rawApps.map((app) => {
      return {
        ...app,
        ...app.Chart,
      }
    })
  },
)

export const makeAppsSelector = (
  defaultParams = {
    orderBy: 'name',
    orderDirection: 'asc',
  },
) => {
  return createSelector(
    [appsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (clusters, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(clusters)
    },
  )
}

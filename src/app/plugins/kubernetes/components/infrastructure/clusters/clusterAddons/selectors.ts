import { Param } from 'api-client/qbert.model'
import createSorter from 'core/helpers/createSorter'
import getDataSelector from 'core/utils/getDataSelector'
import DataKeys from 'k8s/DataKeys'
import { mergeLeft, pipe } from 'ramda'
import { createSelector } from 'reselect'

const parseClusterAddonParams = (params: Param[]) => {
  if (!params) return {}
  return params.reduce((acc, item) => ({...acc, [item.name]: item.value}), {})}

export const clusterAddonsSelector = createSelector(
  [getDataSelector<DataKeys.ClusterAddons>(DataKeys.ClusterAddons, ['clusterId'])],
  (rawClusterAddons) => {
    return rawClusterAddons.map((addon) => ({
      ...addon,
      name: addon.metadata?.name,
      type: addon.spec?.type,
      params: parseClusterAddonParams(addon.spec?.override?.params),
      clusterId: addon.spec?.clusterID,
    }))
  },
)

export const makeClusterAddonsSelector = (defaultParams = {}) => {
  return createSelector(
    [clusterAddonsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (clusterAddons, params) => {
      const { orderBy, orderDirection } = params
      return pipe<any, any>(createSorter({ orderBy, orderDirection }))(clusterAddons)
    },
  )
}

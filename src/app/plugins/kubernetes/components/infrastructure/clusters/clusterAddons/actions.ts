import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import DataKeys from 'k8s/DataKeys'
import { parseClusterParams } from '../actions'
import { getClusterAddonBody } from './helpers'
import { makeClusterAddonsSelector } from './selectors'

const { qbert } = ApiClient.getInstance()

export const clusterAddonActions = createCRUDActions(DataKeys.ClusterAddons, {
  listFn: async (params) => {
    Bugsnag.leaveBreadcrumb('Attempting to get cluster addons', params)
    const [clusterId] = await parseClusterParams(params)
    return clusterId === allKey ? qbert.getAllClusterAddons() : qbert.getClusterAddons(clusterId)
  },
  createFn: async ({ clusterId, addonType, params }) => {
    const body = getClusterAddonBody(clusterId, addonType, params)
    return qbert.addClusterAddon(body)
  },
  updateFn: async ({clusterId, addonType, addonName, params}) => {
    const body = getClusterAddonBody(clusterId, addonType, params)
    return qbert.editClusterAddon(addonName, body)
  },
  deleteFn: async ({ addonName }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete cluster addon', { addon: addonName })
    await qbert.deleteClusterAddon(addonName)
  },
  uniqueIdentifier: 'metadata.name',
  indexBy: 'clusterId',
  selectorCreator: makeClusterAddonsSelector,
})

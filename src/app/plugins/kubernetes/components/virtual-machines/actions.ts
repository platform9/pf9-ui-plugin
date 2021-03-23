import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import DataKeys from 'k8s/DataKeys'
import { flatten, pluck } from 'ramda'
import { someAsync } from 'utils/async'
import { parseClusterParams } from '../infrastructure/clusters/actions'
import { makeVirtualMachinesSelector } from './selectors'

const { qbert } = ApiClient.getInstance()

export const virtualMachineActions = createCRUDActions(DataKeys.VirtualMachines, {
  listFn: async (params) => {
    const [clusterId, clusters] = await parseClusterParams(params)
    return clusterId === allKey
      ? someAsync(pluck<any, any>('uuid', clusters).map(qbert.getVirtualMachines)).then(flatten)
      : qbert.getVirtualMachines(clusterId)
  },
  uniqueIdentifier: 'metadata.uid',
  indexBy: 'clusterId',
  selectorCreator: makeVirtualMachinesSelector,
})

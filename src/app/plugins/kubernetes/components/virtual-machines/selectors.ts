import { createSelector } from 'reselect'
import { propSatisfies, complement, isNil, mergeLeft, pipe, propEq } from 'ramda'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { importedClustersSelector } from '../infrastructure/importedClusters/selectors'
import { findClusterName } from 'k8s/util/helpers'
import { filterIf } from 'utils/fp'
import { allKey } from 'app/constants'
import createSorter from 'core/helpers/createSorter'

export const virtualMachinesSelector = createSelector(
  [
    getDataSelector<DataKeys.VirtualMachines>(DataKeys.VirtualMachines, ['clusterId']),
    clustersSelector,
    importedClustersSelector,
  ],
  (rawVirtualMachines, clusters, importedClusters) => {
    return rawVirtualMachines
      .map((virtualMachine) => ({
        ...virtualMachine,
        id: virtualMachine?.metadata?.uid,
        name: virtualMachine?.metadata?.name,
        clusterName: findClusterName([...clusters, ...importedClusters], virtualMachine.clusterId),
        namespace: virtualMachine?.metadata?.namespace,
        created: virtualMachine?.metadata?.creationTimestamp,
      }))
      .filter(propSatisfies(complement(isNil), 'clusterName'))
  },
)

export const makeVirtualMachinesSelector = (defaultParams = {}) => {
  return createSelector(
    [virtualMachinesSelector, (_, params) => mergeLeft(params, defaultParams)],
    (virtualMachines, params) => {
      const { namespace, orderBy, orderDirection } = params
      return pipe<any, any, any>(
        filterIf(namespace && namespace !== allKey, propEq('namespace', namespace)),
        createSorter({ orderBy, orderDirection }),
      )(virtualMachines)
    },
  )
}

// @ts-nocheck
import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import DataKeys from 'k8s/DataKeys'
import { flatten, pluck } from 'ramda'
import jsYaml from 'js-yaml'
import { someAsync } from 'utils/async'
import { parseClusterParams } from '../infrastructure/clusters/actions'
import { makeVirtualMachinesSelector } from './selectors'
import { trackEvent } from 'utils/tracking'
import createContextLoader from 'core/helpers/createContextLoader'
import { vmVolumeTypes, VMVolumeTypes, Volume } from './model'
import Bugsnag from '@bugsnag/js'

const { qbert } = ApiClient.getInstance()

const volumeSpecApisByType = {
  [VMVolumeTypes.CloudInitNoCloud]: null,
  [VMVolumeTypes.CloudInitConfigDrive]: null,
  [VMVolumeTypes.PersistentVolumeClaim]: null,
  [VMVolumeTypes.DataVolume]: qbert.getVirtualMachineVolumeDetails,
  [VMVolumeTypes.Ephemeral]: null,
  [VMVolumeTypes.ContainerDisk]: null,
  [VMVolumeTypes.EmptyDisk]: null,
  [VMVolumeTypes.HostDisk]: null,
  [VMVolumeTypes.ConfigMap]: null,
  [VMVolumeTypes.Secret]: null,
  [VMVolumeTypes.ServiceAccount]: null,
}
export const findVolumeSpecPromises = (clusterId, namespace, volumes: Volume[] = []) => {
  const promises = []
  volumes.forEach((volume) => {
    vmVolumeTypes.forEach((vmType) => {
      if (volume.hasOwnProperty(vmType)) {
        volume.vmType = vmType
      }
    })
    if (volume.vmType && volumeSpecApisByType[volume.vmType]) {
      // make request and pass the volume name through
      promises.push(
        volumeSpecApisByType[volume.vmType](
          clusterId,
          namespace,
          volume.vmType,
          volume[volume.vmType]?.name,
        ),
      )
    }
  })
  return promises
}

export const virtualMachineDetailsLoader = createContextLoader(
  DataKeys.VirtualMachineDetails,
  async ({ clusterId, namespace, name }) => {
    Bugsnag.leaveBreadcrumb('Attempting to load virtual machine details', {
      clusterId,
      namespace,
      name,
    })
    const vm = await qbert.getVirtualMachineDetails(clusterId, namespace, name)
    const disks = vm?.spec?.domain?.devices?.disks || []
    const volumes = vm?.spec?.volumes || []
    const volumesByDisk = disks.map((disk) => volumes.find((volume) => volume.name === disk.name))
    const volumePromises = findVolumeSpecPromises(clusterId, namespace, volumesByDisk)
    const volumeDetails = await Promise.all(volumePromises)
    // const vmFs = await qbert.getVirtualMachineFileSystemList(clusterId, namespace, name)
    return { ...vm, clusterId, namespace, name, volumeDetails }
  },
  {
    entityName: 'Virtual Machine Detail',
    uniqueIdentifier: 'metadata.uid',
    indexBy: ['clusterId', 'namespace', 'name'],
  },
)

export const virtualMachineActions = createCRUDActions(DataKeys.VirtualMachines, {
  listFn: async (params) => {
    Bugsnag.leaveBreadcrumb('Attempting to get VM instances', params)
    const [clusterId, clusters] = await parseClusterParams(params)
    return clusterId === allKey
      ? someAsync(pluck<any, any>('uuid', clusters).map(qbert.getVirtualMachineInstances)).then(
          flatten,
        )
      : qbert.getVirtualMachineInstances(clusterId)
  },
  createFn: async ({ clusterId, namespace, yaml, vmType }) => {
    Bugsnag.leaveBreadcrumb('Attempting to create new VM', { clusterId, namespace, yaml, vmType })
    const body = jsYaml.safeLoad(yaml)
    const vm: any = await qbert.createVirtualMachine(clusterId, namespace, body, vmType)
    trackEvent('Create New VM', {
      clusterId,
      namespace,
      name: vm?.metadata?.name,
    })
    return vm
  },
  deleteFn: async ({ clusterId, namespace, name }) => {
    return qbert.deleteVirtualMachine(clusterId, namespace, name)
  },
  customOperations: {
    powerVm: async ({ clusterId, namespace, name }) => {
      // TODO this is currently disabled, figure out how to use vm and vmi to determine the power on action
      const deleted = await qbert.powerVirtualMachine(clusterId, namespace, name, false)
      return deleted
    },
  },
  uniqueIdentifier: 'metadata.uid',
  indexBy: 'clusterId',
  selectorCreator: makeVirtualMachinesSelector,
})

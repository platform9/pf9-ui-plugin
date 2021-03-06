import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import jsYaml from 'js-yaml'
import { parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import { makeDeploymentsSelector, makePodsSelector } from 'k8s/components/pods/selectors'
import { ActionDataKeys } from 'k8s/DataKeys'
import { flatten, pluck } from 'ramda'
import { someAsync } from 'utils/async'
import { pathStr } from 'utils/fp'
import { trackEvent } from 'utils/tracking'
import { makeServiceSelector } from './selectors'

const { qbert } = ApiClient.getInstance()

export const podActions = createCRUDActions(ActionDataKeys.Pods, {
  listFn: async (params) => {
    Bugsnag.leaveBreadcrumb('Attempting to get pods', params)
    const [clusterId, clusters] = await parseClusterParams(params)
    return clusterId === allKey
      ? someAsync(pluck('uuid', clusters).map(qbert.getClusterPods)).then(flatten)
      : qbert.getClusterPods(clusterId)
  },
  createFn: async ({ clusterId, namespace, yaml }) => {
    Bugsnag.leaveBreadcrumb('Attempting to create new pod', { clusterId, namespace, yaml })
    const body = jsYaml.safeLoad(yaml)
    const pod = await qbert.createPod(clusterId, namespace, body)
    trackEvent('Create New Pod', {
      clusterId,
      namespace,
      name: pathStr('metadata.name', pod),
    })
    return pod
  },
  deleteFn: async ({ id }, currentItems) => {
    const { clusterId, namespace, name } = await currentItems.find((x) => x.id === id)
    Bugsnag.leaveBreadcrumb('Attempting to delete pod', { id, clusterId, namespace, name })
    const result = await qbert.deletePod(clusterId, namespace, name)
    trackEvent('Delete Pod', { clusterId, namespace, name, id })
    return result
  },
  uniqueIdentifier: 'metadata.uid',
  indexBy: 'clusterId',
  selectorCreator: makePodsSelector,
})

export const deploymentActions = createCRUDActions(ActionDataKeys.Deployments, {
  listFn: async (params) => {
    Bugsnag.leaveBreadcrumb('Attempting to get cluster deployments', params)
    const [clusterId, clusters] = await parseClusterParams(params)
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterDeployments)).then(flatten)
    }
    return qbert.getClusterDeployments(clusterId)
  },
  createFn: async ({ clusterId, namespace, yaml }) => {
    Bugsnag.leaveBreadcrumb('Attempting to create new cluster deployment', {
      clusterId,
      namespace,
      yaml,
    })
    const body = jsYaml.safeLoad(yaml)
    // Also need to refresh the list of pods
    podActions.invalidateCache()
    const created = await qbert.createDeployment(clusterId, namespace, body)
    trackEvent('Create New Deployment', {
      clusterId,
      namespace,
      name: pathStr('metadata.name', created),
      id: pathStr('metadata.uid', created),
    })
    return created
  },
  deleteFn: async ({ clusterId, namespace, name, id }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete cluster deployment', {
      clusterId,
      namespace,
      name,
      id,
    })
    const result = await qbert.deleteDeployment(clusterId, namespace, name)
    trackEvent('Delete Deployment', { clusterId, namespace, name, id })
    return result
  },
  service: 'qbert',
  indexBy: 'clusterId',
  selectorCreator: makeDeploymentsSelector,
})

export const serviceActions = createCRUDActions(ActionDataKeys.KubeServices, {
  listFn: async (params) => {
    Bugsnag.leaveBreadcrumb('Attempting to get cluster services', params)
    const [clusterId, clusters] = await parseClusterParams(params)
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterKubeServices)).then(flatten)
    }
    return qbert.getClusterKubeServices(clusterId)
  },
  createFn: async ({ clusterId, namespace, yaml }) => {
    Bugsnag.leaveBreadcrumb('Attempting to create new cluster service', {
      clusterId,
      namespace,
      yaml,
    })
    const body = jsYaml.safeLoad(yaml)
    const created = await qbert.createService(clusterId, namespace, body)
    trackEvent('Create New Service', {
      clusterId,
      namespace,
      name: pathStr('metadata.name', created),
      id: pathStr('metadata.uid', created),
    })
    return {
      ...created,
      clusterId,
      name: pathStr('metadata.name', created),
      created: pathStr('metadata.creationTimestamp', created),
      id: pathStr('metadata.uid', created),
      namespace: pathStr('metadata.namespace', created),
    }
  },
  deleteFn: async ({ id }, currentItems) => {
    const { clusterId, namespace, name } = await currentItems.find((x) => x.id === id)
    Bugsnag.leaveBreadcrumb('Attempting to delete cluster service', {
      id,
      clusterId,
      namespace,
      name,
    })
    const result = await qbert.deleteService(clusterId, namespace, name)
    trackEvent('Delete Service', { clusterId, namespace, name, id })
    return result
  },
  service: 'qbert',
  entity: ActionDataKeys.KubeServices,
  indexBy: 'clusterId',
  selectorCreator: makeServiceSelector,
})

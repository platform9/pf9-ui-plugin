import { propOr, map, pipe, mergeLeft } from 'ramda'
import { keyValueArrToObj } from 'utils/fp'
import { pathJoin } from 'utils/misc'
import { trackApiMethodMetadata } from 'api-client/helpers'
import ApiService from 'api-client/ApiService'
import {
  Node,
  ClusterElement,
  GetKubernetesVersion,
  GetCloudProvider,
  GetClusterKubeServices,
  GetClusterPods,
  GetClusterDeployments,
  GetClusterNamespaces,
  GetCluster,
  GetPrometheusAlerts,
  GetPrometheusAlertsOverTime,
  GetClusterRoles,
  GetClusterClusterRoles,
  IGenericPayloadWithMetadata,
  IGenericResource,
  GetClusterNamespacesItem,
  INormalizedCluster,
  GetClusterKubeServicesItem,
  GCluster,
  GetClusterRolesItem,
  IGenericClusterizedResponse,
  IGetPrometheusAlertsOverTime,
  GetPrometheusAlertRules,
  AlertManagerAlert,
  SupportedRoleVersions,
} from './qbert.model'
import DataKeys from 'k8s/DataKeys'
import uuid from 'uuid'
import { createUrlWithQueryString } from 'core/utils/routes'
import { ImportedCluster } from 'k8s/components/infrastructure/importedClusters/model'
import { GetVirtualMachineDetails, GetVirtualMachines } from 'k8s/components/virtual-machines/model'
import { convertVolumeTypeToApiParam } from 'k8s/components/virtual-machines/helpers'

type AlertManagerRaw = Omit<Omit<AlertManagerAlert, 'clusterId'>, 'id'>

// TODO: Fix these typings
const normalizeClusterizedResponse = <T>(
  clusterId: string,
  response: GCluster<T>,
): Array<IGenericClusterizedResponse<T>> =>
  pipe(
    propOr([], 'items'),
    map<any, any>(
      mergeLeft<any>({ clusterId }),
    ),
  )(response)

const normalizeClusterizedUpdate = (clusterId, response) => ({
  ...response,
  clusterId,
})

const normalizeCluster = <T>(baseUrl) => (cluster): T & INormalizedCluster => ({
  ...cluster,
  endpoint: cluster.externalDnsName || cluster.masterIp,
  kubeconfigUrl: `${baseUrl}/kubeconfig/${cluster.uuid}`,
  isUpgrading: cluster.taskStatus === 'upgrading',
  nodes: [],
})

const normalizeImportedClusters = (apiResponse: GCluster<ImportedCluster>) => {
  const clusters = apiResponse.items
  const normalizedClusters = clusters.map((cluster) => ({
    ...cluster,
    uuid: cluster.metadata.name,
  }))
  return normalizedClusters
}

/* eslint-disable camelcase */
class Qbert extends ApiService {
  public getClassName() {
    return 'qbert'
  }

  static apiMethodsMetadata = []

  // cachedEndpoint = ''

  protected async getEndpoint() {
    const endpoint = await this.client.keystone.getServiceEndpoint('qbert', 'admin')
    const mappedEndpoint = endpoint.replace(/v(1|2|3)$/, `v3`)

    // Certain operations like column renderers from ListTable need to prepend the Qbert URL to links
    // sent from the backend.  But getting the endpoint is an async operation so we need to make an
    // sync version.  In theory this should always be set since keystone must get the service
    // catalog before any Qbert API calls are made.
    // this.cachedEndpoint = mappedEndpoint
    return mappedEndpoint
  }

  scopedEnpointPath = () => this.client.activeProjectId

  monocularBaseUrl = async () => {
    return this.client.keystone.getServiceEndpoint('monocular', 'public')
  }

  clusterBaseUrl = (clusterId) => `/clusters/${clusterId}/k8sapi/api/v1`

  clusterMonocularBaseUrl = (clusterId, version = 'v1') =>
    pathJoin(
      this.clusterBaseUrl(clusterId),
      'namespaces',
      'kube-system',
      'services',
      'monocular-api-svc:80',
      'proxy',
      version || '/',
    )

  /* Cloud Providers */
  @trackApiMethodMetadata({ url: '/cloudProviders', type: 'GET' })
  getCloudProviders = async () => {
    const url = `/cloudProviders`
    return this.client.basicGet<GetCloudProvider[]>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getCloudProviders',
      },
    })
  }

  @trackApiMethodMetadata({ url: '/cloudProviders', type: 'POST' })
  createCloudProvider = async (body) => {
    const url = `/cloudProviders`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createCloudProvider',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/cloudProviders/{cloudProviderUuid}',
    type: 'GET',
    params: ['cloudProviderUuid'],
  })
  getCloudProviderDetails = async (cpId) => {
    const url = `/cloudProviders/${cpId}`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getCloudProviderDetails',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/cloudProviders/{cloudProviderUuid}/region/{regionName}',
    type: 'GET',
    params: ['cloudProviderUuid', 'regionName'],
  })
  getCloudProviderRegionDetails = async (cpId, regionId) => {
    const url = `/cloudProviders/${cpId}/region/${regionId}`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getCloudProviderRegionDetails',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/cloudProviders/{cloudProviderUuid}',
    type: 'PUT',
    params: ['cloudProviderUuid'],
  })
  updateCloudProvider = async (cpId, body) => {
    const url = `/cloudProviders/${cpId}`
    return this.client.basicPut({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateCloudProvider',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/cloudProviders/{cloudProviderUuid}',
    type: 'DELETE',
    params: ['cloudProviderUuid'],
  })
  deleteCloudProvider = async (cpId) => {
    const url = `/cloudProviders/${cpId}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteCloudProvider',
      },
    })
  };

  [DataKeys.CloudProviders] = {
    create: this.createCloudProvider.bind(this),
    list: this.getCloudProviders.bind(this),
    details: this.getCloudProviderDetails.bind(this),
    regionDetails: this.getCloudProviderDetails.bind(this),
    update: this.updateCloudProvider.bind(this),
    delete: this.deleteCloudProvider.bind(this),
  }

  /* Cloud Providers Types */
  @trackApiMethodMetadata({ url: '/cloudProvider/types', type: 'GET' })
  getCloudProviderTypes = async () => {
    const url = `/cloudProvider/types`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getCloudProviderTypes',
      },
    })
  }

  /* Node Pools */
  @trackApiMethodMetadata({ url: '/nodePools', type: 'GET' })
  getNodePools = async () => {
    const url = `/nodePools`
    return this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getNodePools',
      },
    })
  }

  /* Nodes */
  @trackApiMethodMetadata({ url: '/nodes', type: 'GET' })
  getNodes = async () => {
    const url = `/nodes`
    return this.client.basicGet<Node[]>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getNodes',
      },
    })
  };

  [DataKeys.Nodes] = {
    list: this.getNodes,
  }

  /* SSH Keys */
  @trackApiMethodMetadata({
    url: '/cloudProviders/{cloudProviderUuid}/region/{regionName}',
    type: 'PUT',
    params: ['cloudProviderUuid', 'regionName'],
  })
  importSshKey = async (cpId, regionId, body) => {
    const url = `/cloudProviders/${cpId}/region/${regionId}`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'importSshKey',
      },
    })
  }

  /* Clusters */
  @trackApiMethodMetadata({ url: '/clusters', type: 'GET' })
  getClusters = async () => {
    const url = `/clusters`
    const rawClusters = await this.client.basicGet<ClusterElement[]>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusters',
      },
    })
    const baseUrl = await this.getApiEndpoint()
    return rawClusters.map(normalizeCluster<ClusterElement>(baseUrl))
  }

  getSunpikeApis = async () => {
    const url = `/sunpike/apis/sunpike.platform9.com`
    return this.client.basicGet<any>({
      url,
      version: 'v4',
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusters',
      },
    })
  }

  getImportedClusters = async () => {
    const url = `/sunpike/apis/sunpike.platform9.com/v1alpha2/clusters`
    const response = await this.client.basicGet<GCluster<ImportedCluster>>({
      url,
      version: 'v4',
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusters',
      },
    })
    return normalizeImportedClusters(response)
  }

  @trackApiMethodMetadata({ url: '/clusters/{clusterUuid}', type: 'GET', params: ['clusterUuid'] })
  getClusterDetails = async (clusterId) => {
    const url = `/clusters/${clusterId}`
    const cluster = await this.client.basicGet({
      url,
      // version: 'v4', // TODO update to v4 when backend releases 5.1
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterDetails',
      },
    })
    const baseUrl = await this.getApiEndpoint()
    return normalizeCluster(baseUrl)(cluster)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/platform9-system/services/pf9-sentry/proxy/v1/storage',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getClusterCsiDrivers = async (clusterUuid) => {
    const url = pathJoin(
      'clusters',
      clusterUuid,
      'k8sapi/api/v1/namespaces/platform9-system/services/pf9-sentry/proxy/v1/storage',
    )
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterCsiDrivers',
      },
    })
  }

  getK8sSupportedRoleVersions = async (body) => {
    const url = '/clusters/supportedRoleVersions'
    const supportedRoleVersions = await this.client.basicGet<SupportedRoleVersions>({
      url,
      version: 'v4',
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterDetails',
      },
    })
    return supportedRoleVersions
  }

  createCluster = async (body) => {
    // Note: This API response only returns new `uuid` in the response.
    // You might want to do a GET afterwards if you need any of the cluster information.
    const url = `/clusters`
    return this.client.basicPost<ClusterElement>({
      url,
      version: 'v4',
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createCluster',
      },
    })
  }

  @trackApiMethodMetadata({ url: '/clusters/{clusterUuid}', type: 'PUT', params: ['clusterUuid'] })
  updateCluster = async (clusterId, body) => {
    const url = `/clusters/${clusterId}`
    return this.client.basicPut({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateCluster',
      },
    })
  }

  upgradeClusterNodes = async (clusterId, type, body = null) => {
    const url = createUrlWithQueryString(`/clusters/${clusterId}/upgrade?type=${type}`)
    const upgradeClusterNodesOptions = {
      url,
      version: 'v4',
      options: {
        clsName: this.getClassName(),
        mthdName: 'upgradeClusterNodes',
      },
    }
    return this.client.basicPost({ ...upgradeClusterNodesOptions, body })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}',
    type: 'DELETE',
    params: ['clusterUuid'],
  })
  deleteCluster = async (clusterId) => {
    const url = `/clusters/${clusterId}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteCluster',
      },
    })
  };

  [DataKeys.Clusters] = {
    list: this.getClusters,
  }

  // @param clusterId = cluster.uuid
  // @param nodes = [{ uuid: node.uuid, isMaster: (true|false) }]
  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/attach',
    type: 'POST',
    params: ['clusterUuid'],
  })
  attachNodes = async (clusterId, body) => {
    const url = `/clusters/${clusterId}/attach`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'attachNodes',
      },
    })
  }

  // @param clusterId = cluster.uuid
  // @param nodes = [node1Uuid, node2Uuid, ...]
  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/detach',
    type: 'POST',
    params: ['clusterUuid'],
  })
  detachNodes = async (clusterId, nodeUuids) => {
    const body = nodeUuids.map((nodeUuid) => ({ uuid: nodeUuid }))
    const url = `/clusters/${clusterId}/detach`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'detachNodes',
      },
    })
  }

  @trackApiMethodMetadata({ url: '/webcli/{clusterUuid}', type: 'POST', params: ['clusterUuid'] })
  getCliToken = async (clusterId, namespace) => {
    const url = `/webcli/${clusterId}`
    const response = await this.client.basicPost<any>({
      url,
      body: {
        namespace,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'getCliToken',
      },
    })
    return response.token
  }

  @trackApiMethodMetadata({
    url: '/kubeconfig/{clusterUuid}',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getKubeConfig = async (clusterId) => {
    const url = `/kubeconfig/${clusterId}`
    return this.client.basicGet<string>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getKubeConfig',
      },
    })
  }

  discoverExternalClusters = async (body) => {
    const url = '/externalClusters/discover'
    const discoveredClusters = await this.client.basicPost<any>({
      url,
      version: 'v4',
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'discoverExternalClusters',
      },
    })
    return discoveredClusters
  }

  @trackApiMethodMetadata({
    url: '/externalClusters/register',
    type: 'POST',
  })
  registerExternalCluster = async (body) => {
    const url = '/externalClusters/register'
    const registeredCluster = await this.client.basicPost<any>({
      url,
      version: 'v4',
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'registerExternalCluster',
      },
    })
    return registeredCluster
  }

  deregisterExternalCluster = async (id) => {
    const url = `/externalClusters/${id}/deregister`
    return this.client.basicPost({
      url,
      body: {},
      version: 'v4',
      options: {
        clsName: this.getClassName(),
        mthdName: 'deregisterExternalCluster',
      },
    })
  }

  /* k8s API */
  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/version',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getKubernetesVersion = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/version`
    return this.client.basicGet<GetKubernetesVersion>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getKubernetesVersion',
      },
    })
  }

  convertResource = <T extends IGenericPayloadWithMetadata>(clusterId) => (
    item: T,
  ): IGenericResource<T> => ({
    ...item,
    clusterId,
    name: item.metadata.name,
    created: item.metadata.creationTimestamp,
    id: item.metadata.uid,
    namespace: item.metadata.namespace,
  })

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getClusterNamespaces = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/namespaces`
    const data = await this.client.basicGet<GetClusterNamespaces>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterNamespaces',
      },
    })
    return data.items.map(this.convertResource<GetClusterNamespacesItem>(clusterId))
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces',
    type: 'POST',
    params: ['clusterUuid'],
  })
  createNamespace = async (clusterId, body) => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/namespaces`
    const raw = await this.client.basicPost<any>({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createNamespace',
      },
    })
    return this.convertResource(clusterId)(raw)
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/{namespace}',
    type: 'DELETE',
    params: ['clusterUuid', 'namespace'],
  })
  deleteNamespace = async (clusterId, namespaceName) => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespaceName}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteNamespace',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/api/v1/pods',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getClusterPods = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/pods`
    const data = await this.client.basicGet<GetClusterPods>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterPods',
      },
    })
    return data.items.map(this.convertResource(clusterId))
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/apps/v1/deployments',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getClusterDeployments = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/apps/v1/deployments`
    const data = await this.client.basicGet<GetClusterDeployments>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterDeployments',
      },
    })
    return data.items.map(this.convertResource(clusterId))
  }

  @trackApiMethodMetadata({
    url: '/k8sapi/apis/apps/v1/namespaces/{namespace}/deployments/{deployment}',
    type: 'DELETE',
    params: ['namespace', 'deployment'],
  })
  deleteDeployment = async (clusterId, namespace, name) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/apps/v1/namespaces/${namespace}/deployments/${name}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteDeployment',
      },
    })
  }

  @trackApiMethodMetadata({
    url: 'clusters/{clusterUuid}/k8sapi/api/v1/services',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getClusterKubeServices = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/services`
    const data = await this.client.basicGet<GetClusterKubeServices>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterKubeServices',
      },
    })
    return data.items.map(this.convertResource<GetClusterKubeServicesItem>(clusterId))
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/storage.k8s.io/v1/storageclasses',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getClusterStorageClasses = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/storage.k8s.io/v1/storageclasses`
    const data = await this.client.basicGet<GetCluster>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterStorageClasses',
      },
    })
    return data.items.map(this.convertResource(clusterId))
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/storage.k8s.io/v1/storageclasses',
    type: 'POST',
    params: ['clusterUuid'],
  })
  createStorageClass = async (clusterId, body) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/storage.k8s.io/v1/storageclasses`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createStorageClass',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/storage.k8s.io/v1/storageclasses/{storageClass}',
    type: 'DELETE',
    params: ['clusterUuid', 'storageClass'],
  })
  deleteStorageClass = async (clusterId, name) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/storage.k8s.io/v1/storageclasses/${name}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteStorageClass',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/apps/v1/replicasets',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getReplicaSets = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/apps/v1/replicasets`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getReplicaSets',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/kubevirt.io/v1/virtualmachineinstances',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getVirtualMachineInstances = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/kubevirt.io/v1/virtualmachineinstances`
    const data = await this.client.basicGet<GetVirtualMachines>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getVirtualMachineInstances',
      },
    })
    return data.items.map((item) => ({ ...item, clusterId }))
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/kubevirt.io/v1/virtualmachines',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getVirtualMachines = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/kubevirt.io/v1/virtualmachines`
    const data = await this.client.basicGet<GetVirtualMachines>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getVirtualMachines',
      },
    })
    return data.items.map((item) => ({ ...item, clusterId }))
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/kubevirt.io/v1/namespaces/{namespace}/virtualmachineinstances/{name}',
    type: 'GET',
    params: ['clusterUuid', 'namespace', 'name'],
  })
  getVirtualMachineDetails = async (clusterId, namespace, name) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/kubevirt.io/v1/namespaces/${namespace}/virtualmachineinstances/${name}`
    const data = await this.client.basicGet<GetVirtualMachineDetails>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getVirtualMachineDetails',
      },
    })
    return data
  }

  getVirtualMachineVolumeDetails = async (clusterId, namespace, volumeType, name) => {
    // cdi.kubevirt.io/v1beta1/namespaces/default/datavolumes/dv-rootfs
    const url = `/clusters/${clusterId}/k8sapi/apis/cdi.kubevirt.io/v1beta1/namespaces/${namespace}/${convertVolumeTypeToApiParam(
      volumeType,
    )}/${name}`
    const data = await this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getVirtualMachineVolumeDetails',
      },
    })
    return data
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/kubevirt.io/v1/namespaces/{namespace}/{virtualMachineType}',
    type: 'POST',
    params: ['clusterUuid', 'namespace', 'virtualMachineType'],
  })
  createVirtualMachine = async (clusterId, namespace, body, vmType = '') => {
    const virtualMachineType = `${vmType.toLowerCase()}s`
    const url = `/clusters/${clusterId}/k8sapi/apis/kubevirt.io/v1/namespaces/${namespace}/${virtualMachineType}`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createVirtualMachine',
      },
    })
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/kubevirt.io/v1/namespaces/{namespace}/virtualmachineinstances/{name}',
    type: 'PUT',
    params: ['clusterUuid', 'namespace', 'name'],
  })
  updateVirtualMachine = async (clusterId, namespace, name) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/kubevirt.io/v1/namespaces/${namespace}/virtualmachineinstances/${name}`
    return this.client.basicPut({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateVirtualMachine',
      },
    })
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/kubevirt.io/v1/namespaces/{namespace}/virtualmachineinstances/{name}',
    type: 'DELETE',
    params: ['clusterUuid', 'namespace', 'name'],
  })
  deleteVirtualMachine = async (clusterId, namespace, name) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/kubevirt.io/v1/namespaces/${namespace}/virtualmachineinstances/${name}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteVirtualMachine',
      },
    })
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/subresources.kubevirt.io/v1/namespaces/{namespace}/virtualmachines/{name}/{powerOn}',
    type: 'DELETE',
    params: ['clusterUuid', 'namespace', 'name', 'powerOn'],
  })
  powerVirtualMachine = async (clusterId, namespace, name, powerOn = true) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachines/${name}/${
      powerOn ? 'start' : 'stop'
    }`
    return this.client.basicPut({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'powerVirtualMachine',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/{namespace}/pods',
    type: 'POST',
    params: ['clusterUuid', 'namespace'],
  })
  createPod = async (clusterId, namespace, body) => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/pods`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createPod',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/{namespace}/pods/{podName}',
    type: 'DELETE',
    params: ['clusterUuid', 'namespace', 'podName'],
  })
  deletePod = async (clusterId, namespace, name) => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/pods/${name}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deletePod',
      },
    })
  };

  [DataKeys.Pods] = {
    create: this.createPod.bind(this),
    list: this.getClusterPods.bind(this),
    delete: this.deletePod.bind(this),
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/apps/v1/namespaces/{namespace}/deployments',
    type: 'POST',
    params: ['clusterUuid', 'namespace'],
  })
  createDeployment = async (clusterId, namespace, body) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/apps/v1/namespaces/${namespace}/deployments`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createDeployment',
      },
    })
  };

  [DataKeys.Deployments] = {
    create: this.createDeployment.bind(this),
    list: this.getClusterDeployments.bind(this),
    delete: this.deleteDeployment.bind(this),
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/{namespace}/services',
    type: 'POST',
    params: ['clusterUuid', 'namespace'],
  })
  createService = async (clusterId, namespace, body) => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/services`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createService',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/{namespace}/services/{service}',
    type: 'DELETE',
    params: ['clusterUuid', 'namespace', 'service'],
  })
  deleteService = async (clusterId, namespace, name) => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/services/${name}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteService',
      },
    })
  };

  [DataKeys.KubeServices] = {
    create: this.createService.bind(this),
    list: this.getClusterKubeServices.bind(this),
    delete: this.deleteService.bind(this),
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/{namespace}/serviceaccounts',
    type: 'POST',
    params: ['clusterUuid', 'namespace'],
  })
  createServiceAccount = async (clusterId, namespace, body) => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/serviceaccounts`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createServiceAccount',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/{namespace}/serviceaccounts',
    type: 'GET',
    params: ['clusterUuid', 'namespace'],
  })
  getServiceAccounts = async (clusterId, namespace) => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/serviceaccounts`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getServiceAccounts',
      },
    })
    return response && response.items
  }

  /* RBAC */
  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/roles',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getClusterRoles = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/roles`
    const response = await this.client.basicGet<GetClusterRoles>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterRoles',
      },
    })
    return normalizeClusterizedResponse<GetClusterRolesItem>(clusterId, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/{namespace}/roles',
    type: 'POST',
    params: ['clusterUuid', 'namespace'],
  })
  createClusterRole = async (clusterId, namespace, body) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles`
    const response = await this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createClusterRole',
      },
    })
    return normalizeClusterizedUpdate(clusterId, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/{namespace}/roles/{role}',
    type: 'PUT',
    params: ['clusterUuid', 'namespace', 'role'],
  })
  updateClusterRole = async (clusterId, namespace, name, body) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles/${name}`
    const response = await this.client.basicPut({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateClusterRole',
      },
    })
    return normalizeClusterizedUpdate(clusterId, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/{namespace}/roles/{role}',
    type: 'DELETE',
    params: ['clusterUuid', 'namespace', 'role'],
  })
  deleteClusterRole = async (clusterId, namespace, name) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles/${name}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteClusterRole',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterroles',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getClusterClusterRoles = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterroles`
    const response = await this.client.basicGet<GetClusterClusterRoles>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterClusterRoles',
      },
    })
    return normalizeClusterizedResponse(clusterId, response)
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterroles',
    type: 'POST',
    params: ['clusterUuid'],
  })
  createClusterClusterRole = async (clusterId, body) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterroles`
    const response = await this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createClusterClusterRole',
      },
    })
    return normalizeClusterizedUpdate(clusterId, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterroles/{clusterRole}',
    type: 'PUT',
    params: ['clusterUuid', 'clusterRole'],
  })
  updateClusterClusterRole = async (clusterId, name, body) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterroles/${name}`
    const response = await this.client.basicPut({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateClusterClusterRole',
      },
    })
    return normalizeClusterizedUpdate(clusterId, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterroles/{clusterRole}',
    type: 'DELETE',
    params: ['clusterUuid', 'clusterRole'],
  })
  deleteClusterClusterRole = async (clusterId, name) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterroles/${name}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteClusterClusterRole',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/rolebindings',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getClusterRoleBindings = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/rolebindings`
    const response = await this.client.basicGet<GetCluster>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterRoleBindings',
      },
    })
    return normalizeClusterizedResponse(clusterId, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/{namespace}/rolebindings',
    type: 'POST',
    params: ['clusterUuid', 'namespace'],
  })
  createClusterRoleBinding = async (clusterId, namespace, body) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/rolebindings`
    const response = await this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createClusterRoleBinding',
      },
    })
    return normalizeClusterizedUpdate(clusterId, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/{namespace}/rolebindings/{roleBinding}',
    type: 'PUT',
    params: ['clusterUuid', 'namespace', 'roleBinding'],
  })
  updateClusterRoleBinding = async (clusterId, namespace, name, body) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/rolebindings/${name}`
    const response = await this.client.basicPut({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateClusterRoleBinding',
      },
    })
    return normalizeClusterizedUpdate(clusterId, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/{namespace}/rolebindings/{roleBinding}',
    type: 'DELETE',
    params: ['clusterUuid', 'namespace', 'roleBinding'],
  })
  deleteClusterRoleBinding = async (clusterId, namespace, name) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/rolebindings/${name}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteClusterRoleBinding',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterrolebindings',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getClusterClusterRoleBindings = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterrolebindings`
    const response = await this.client.basicGet<GetCluster>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getClusterClusterRoleBindings',
      },
    })
    return normalizeClusterizedResponse(clusterId, response)
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterrolebindings',
    type: 'POST',
    params: ['clusterUuid'],
  })
  createClusterClusterRoleBinding = async (clusterId, body) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterrolebindings`
    const response = await this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createClusterClusterRoleBinding',
      },
    })
    return normalizeClusterizedUpdate(clusterId, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/{clusterRoleBinding}',
    type: 'PUT',
    params: ['clusterUuid', 'clusterRoleBinding'],
  })
  updateClusterClusterRoleBinding = async (clusterId, name, body) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/${name}`
    const response = await this.client.basicPut({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateClusterClusterRoleBinding',
      },
    })
    return normalizeClusterizedUpdate(clusterId, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/{clusterRoleBinding}',
    type: 'DELETE',
    params: ['clusterUuid', 'clusterRoleBinding'],
  })
  deleteClusterClusterRoleBinding = async (clusterId, name) => {
    const url = `/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/${name}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteClusterClusterRoleBinding',
      },
    })
  }

  /* RBAC Profiles */
  getRbacProfiles = async () => {
    const url = `/sunpike/apis/sunpike.platform9.com/v1alpha2/namespaces/sunpike-profiles/clusterprofiles`
    const response = await this.client.basicGet<any>({
      url,
      version: 'v4',
      options: {
        clsName: this.getClassName(),
        mthdName: 'getRbacProfiles',
      },
    })
    return response && response.items
  }

  createRbacProfile = async (body) => {
    const url = `/sunpike/apis/sunpike.platform9.com/v1alpha2/namespaces/sunpike-profiles/clusterprofiles`
    const response = await this.client.basicPost({
      url,
      body,
      version: 'v4',
      options: {
        clsName: this.getClassName(),
        mthdName: 'createRbacProfile',
      },
    })
    return response
  }

  patchRbacProfile = async (name, body) => {
    const url = `/sunpike/apis/sunpike.platform9.com/v1alpha2/namespaces/sunpike-profiles/clusterprofiles/${name}`
    const response = await this.client.basicPatch<any>({
      url,
      body,
      version: 'v4',
      options: {
        clsName: this.getClassName(),
        mthdName: 'patchRbacProfile',
        config: {
          headers: {
            'Content-Type': 'application/merge-patch+json',
          },
        },
      },
    })
    return response
  }

  deleteRbacProfile = async (name) => {
    const url = `/sunpike/apis/sunpike.platform9.com/v1alpha2/namespaces/sunpike-profiles/clusterprofiles/${name}`
    await this.client.basicDelete({
      url,
      version: 'v4',
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteRbacProfile',
      },
    })
  }

  getRbacProfileBindings = async () => {
    const url = `/sunpike/apis/sunpike.platform9.com/v1alpha2/namespaces/sunpike-profiles/clusterprofilebindings`
    const response = await this.client.basicGet<any>({
      url,
      version: 'v4',
      options: {
        clsName: this.getClassName(),
        mthdName: 'getRbacProfileBindings',
      },
    })
    return response && response.items
  }

  createRbacProfileBinding = async (body) => {
    const url = `/sunpike/apis/sunpike.platform9.com/v1alpha2/namespaces/sunpike-profiles/clusterprofilebindings`
    const response = await this.client.basicPost({
      url,
      body,
      version: 'v4',
      options: {
        clsName: this.getClassName(),
        mthdName: 'createClusterClusterRoleBinding',
      },
    })
    return response
  }

  /* Managed Apps */
  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/prometheuses',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getPrometheusInstances = async (clusterUuid) => {
    const url = `/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/prometheuses`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getPrometheusInstances',
      },
    })
    return normalizeClusterizedResponse(clusterUuid, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/{namespace}/prometheuses/{prometheusInstance}',
    type: 'PATCH',
    params: ['clusterUuid', 'namespace', 'prometheusInstance'],
  })
  updatePrometheusInstance = async (data) => {
    const { clusterUuid, namespace, name } = data
    const body = [
      { op: 'replace', path: '/spec/replicas', value: data.replicas },
      { op: 'replace', path: '/spec/retention', value: data.retention },
      { op: 'replace', path: '/spec/resources/requests/cpu', value: data.cpu },
      { op: 'replace', path: '/spec/resources/requests/memory', value: data.memory },
    ]
    const url = `/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheuses/${name}`
    const response = await this.client.basicPatch({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updatePrometheusInstance',
      },
    })
    return normalizeClusterizedUpdate(clusterUuid, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/{namespace}/prometheuses/{prometheusInstance}',
    type: 'DELETE',
    params: ['clusterUuid', 'namespace', 'prometheusInstance'],
  })
  deletePrometheusInstance = async (clusterUuid, namespace, name) => {
    const url = `/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheuses/${name}`
    await this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deletePrometheusInstance',
      },
    })
  }

  createPrometheusInstance = async (clusterId, data) => {
    const requests: { cpu?: string; memory?: string } = {}
    if (data.cpu) {
      requests.cpu = data.cpu
    }
    if (data.memory) {
      requests.memory = data.memory
    }
    // if (data.storage) { requests.storage = data.storage }

    const apiVersion = 'monitoring.coreos.com/v1'

    const serviceMonitor = {
      prometheus: data.name,
      role: 'service-monitor',
    }

    const appLabels = keyValueArrToObj(data.appLabels)
    const ruleSelector = {
      prometheus: data.name,
      role: 'alert-rules',
    }

    const prometheusBody = {
      apiVersion,
      kind: 'Prometheus',
      metadata: {
        name: data.name,
        namespace: data.namespace,
      },
      spec: {
        replicas: data.replicas,
        retention: data.retention,
        resources: { requests },
        serviceMonitorSelector: { matchLabels: serviceMonitor },
        serviceAccountName: data.serviceAccountName,
        ruleSelector: { matchLabels: ruleSelector },
      },
    }

    // TODO: How do we specifiy "Enable persistent storage" in the API call?  What does this field mean in the
    // context of a Prometheus Instance?  Where will it be stored?  Do we need to specify PVC and StorageClasses?

    const serviceMonitorBody = {
      apiVersion,
      kind: 'ServiceMonitor',
      metadata: {
        name: `${data.name}-service-monitor`,
        namespace: data.namespace,
        labels: serviceMonitor,
      },
      spec: {
        endpoints: [{ port: data.port }],
        selector: { matchLabels: appLabels },
      },
    }

    /*
    let alertManagerBody = {
      // TODO: what goes in here
    }
    */

    const prometheusRulesBody = {
      apiVersion,
      kind: 'PrometheusRule',
      metadata: {
        labels: ruleSelector,
        name: `${data.name}-prometheus-rules`,
        namespace: data.namespace,
      },
      spec: {
        groups: [
          {
            name: `${data.name}-rule-group`,
            rules: data.rules,
          },
        ],
      },
    }

    const prometheusUrl = `/clusters/${clusterId}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${data.namespace}/prometheuses`
    const response = await this.client.basicPost({
      url: prometheusUrl,
      body: prometheusBody,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createPrometheusInstance',
      },
    })
    const serviceMonitorUrl = `/clusters/${clusterId}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${data.namespace}/servicemonitors`
    await this.client.basicPost({
      url: serviceMonitorUrl,
      body: serviceMonitorBody,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createPrometheusInstance/servicemonitors',
      },
    })
    const url = `/clusters/${clusterId}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${data.namespace}/prometheusrules`
    await this.client.basicPost({
      url,
      body: prometheusRulesBody,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createPrometheusInstance/prometheusrules',
      },
    })
    // this.client.basicPost(`/clusters/${clusterId}/k8sapi/apis/monitoring.coreos.com/v1/alertmanagers`, alertManagerBody)
    return response
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-alertmanager:9093/proxy/api/v2/alerts',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getAlertManagerAlerts = async (clusterUuid): Promise<AlertManagerAlert[]> => {
    const url = `/clusters/${clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-alertmanager:9093/proxy/api/v2/alerts`
    const alerts = await this.client.basicGet<AlertManagerRaw[]>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getPrometheusAlerts',
      },
    })
    return alerts?.map((alert) => ({
      ...alert,
      clusterId: clusterUuid,
      id: `${alert.fingerprint}-${clusterUuid}`,
    }))
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-alertmanager:9093/proxy/api/v2/silences',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getAlertManagerSilences = async (clusterId): Promise<any> => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-alertmanager:9093/proxy/api/v2/silences`
    const silences = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getSilences',
      },
    })
    return silences?.map((silence) => ({
      ...silence,
      clusterId: clusterId,
    }))
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-alertmanager:9093/proxy/api/v2/silences',
    type: 'POST',
    params: ['clusterUuid'],
  })
  createAlertManagerSilence = async (clusterId, body): Promise<any> => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-alertmanager:9093/proxy/api/v2/silences`
    const silence = await this.client.basicPost<any>({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createSilence',
      },
    })
    return {
      ...silence,
      clusterId: clusterId,
    }
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-alertmanager:9093/proxy/api/v2/silence/{silenceId}',
    type: 'DELETE',
    params: ['clusterUuid', 'silenceId'],
  })
  deleteAlertManagerSilence = async (clusterId, silenceId): Promise<any> => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-alertmanager:9093/proxy/api/v2/silence/${silenceId}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteSilence',
      },
    })
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-prometheus:9090/proxy/api/v1/alerts',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getPrometheusAlerts = async (clusterUuid) => {
    const url = `/clusters/${clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-prometheus:9090/proxy/api/v1/alerts`
    const response = await this.client.basicGet<GetPrometheusAlerts>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getPrometheusAlerts',
      },
    })
    return response.alerts.map((alert) => ({
      ...alert,
      clusterId: clusterUuid,
      id: uuid.v4(),
    }))
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-prometheus:9090/proxy/api/v1/rules',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getPrometheusAlertRules = async (clusterUuid) => {
    const url = `/clusters/${clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-prometheus:9090/proxy/api/v1/rules`
    const response = await this.client.basicGet<GetPrometheusAlertRules>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getPrometheusAlertRules',
      },
    })
    const alertRules = response.groups
      .flatMap((group) => {
        return group.rules
      })
      .filter((rule) => rule.type === 'alerting')
      .map((rule) => ({
        ...rule,
        clusterId: clusterUuid,
        id: `${rule.name}${clusterUuid}`,
      }))
    return alertRules
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-prometheus:9090/proxy/api/v1/query_range?query=ALERTS&start={startTime}&end={endTime}&step={step}',
    type: 'GET',
    params: ['clusterUuid', 'startTime', 'endTime', 'step'],
  })
  getPrometheusAlertsOverTime = async (
    clusterUuid,
    startTime,
    endTime,
    step,
  ): Promise<IGetPrometheusAlertsOverTime[]> => {
    const url = `/clusters/${clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-prometheus:9090/proxy/api/v1/query_range?query=ALERTS&start=${startTime}&end=${endTime}&step=${step}`
    const response = await this.client.basicGet<GetPrometheusAlertsOverTime>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getPrometheusAlertsOverTime',
      },
    })
    return response.result.map((alert) => ({
      ...alert,
      startTime,
      endTime,
      clusterId: clusterUuid,
    }))
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/servicemonitors',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getPrometheusServiceMonitors = async (clusterUuid) => {
    const url = `/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/servicemonitors`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getPrometheusServiceMonitors',
      },
    })
    return normalizeClusterizedResponse(clusterUuid, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/{namespace}/servicemonitors/{serviceMonitor}',
    type: 'PATCH',
    params: ['clusterUuid', 'namespace', 'serviceMonitor'],
  })
  updatePrometheusServiceMonitor = async (data) => {
    const { clusterUuid, namespace, name } = data
    const body = [
      {
        op: 'replace',
        path: '/metadata/labels',
        value: data.labels,
      },
    ]
    const url = `/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/servicemonitors/${name}`
    const response = await this.client.basicPatch({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updatePrometheusServiceMonitor',
      },
    })
    return normalizeClusterizedUpdate(clusterUuid, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/{namespace}/servicemonitors/{serviceMonitor}',
    type: 'DELETE',
    params: ['clusterUuid', 'namespace', 'serviceMonitor'],
  })
  deletePrometheusServiceMonitor = async (clusterUuid, namespace, name) => {
    const url = `/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/servicemonitors/${name}`
    await this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deletePrometheusServiceMonitor',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/prometheusrules',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getPrometheusRules = async (clusterUuid) => {
    const url = `/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/prometheusrules`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getPrometheusRules',
      },
    })
    return normalizeClusterizedResponse(clusterUuid, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/{namespace}/prometheusrules/{prometheusRule}',
    type: 'PATCH',
    params: ['clusterUuid', 'namespace', 'prometheusRule'],
  })
  updatePrometheusRules = async (rulesObject) => {
    const { clusterUuid, namespace, name } = rulesObject
    const body = [
      {
        op: 'replace',
        path: '/spec/groups/0/rules',
        value: rulesObject.rules,
      },
    ]
    const url = `/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheusrules/${name}`
    const response = await this.client.basicPatch({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updatePrometheusRules',
      },
    })
    return normalizeClusterizedUpdate(clusterUuid, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/{namespace}/prometheusrules/{prometheusRule}',
    type: 'DELETE',
    params: ['clusterUuid', 'namespace', 'prometheusRule'],
  })
  deletePrometheusRule = async (clusterUuid, namespace, name) => {
    const url = `/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheusrules/${name}`
    await this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deletePrometheusRule',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/alertmanagers',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getPrometheusAlertManagers = async (clusterUuid) => {
    const url = `/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/alertmanagers`
    const response = await this.client.basicGet<any>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getPrometheusAlertManagers',
      },
    })
    return normalizeClusterizedResponse(clusterUuid, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/{namespace}/alertmanagers/{alertManager}',
    type: 'PATCH',
    params: ['clusterUuid', 'namespace', 'alertManager'],
  })
  updatePrometheusAlertManager = async (data) => {
    const { clusterUuid, namespace, name } = data
    const body = [{ op: 'replace', path: '/spec/replicas', value: data.replicas }]
    const url = `/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/alertmanagers/${name}`
    const response = await this.client.basicPatch({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updatePrometheusAlertManager',
      },
    })
    return normalizeClusterizedUpdate(clusterUuid, response)
  }

  @trackApiMethodMetadata({
    url:
      '/clusters/{clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/{namespace}/alertmanagers/{alertManager}',
    type: 'DELETE',
    params: ['clusterUuid', 'namespace', 'alertManager'],
  })
  deletePrometheusAlertManager = async (clusterUuid, namespace, name) => {
    const url = `/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/alertmanagers/${name}`
    await this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deletePrometheusAlertManager',
      },
    })
  }

  getPrometheusDashboardLink = async (instance) =>
    `${await this.getApiEndpoint()}/clusters/${instance.clusterUuid}/k8sapi${instance.dashboard}`

  // TODO: Loggings
  getLoggingsBaseUrl = (clusterUuid) =>
    `/clusters/${clusterUuid}/k8sapi/apis/logging.pf9.io/v1alpha1/outputs`

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/logging.pf9.io/v1alpha1/outputs',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getLoggings = async (clusterUuid) => {
    const url = this.getLoggingsBaseUrl(clusterUuid)
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getLoggings',
      },
    })
  }

  createLogging = async (clusterUuid, body) => {
    const url = this.getLoggingsBaseUrl(clusterUuid)
    const response = await this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createLogging',
      },
    })
    return response
  }

  updateLogging = async (clusterUuid, body) => {
    const url = `${this.getLoggingsBaseUrl(clusterUuid)}/${body.uuid}`
    return this.client.basicPut<{ id: string }>({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateLogging',
      },
    })
    // TODO use models on basic methods
  }

  deleteLogging = async (clusterUuid, loggingUuid) => {
    const url = `${this.getLoggingsBaseUrl(clusterUuid)}/${loggingUuid}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteLogging',
      },
    })
  }

  // API Resources
  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getApiGroupList = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/apis`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getApiGroupList',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/apis/{apiGroup}',
    type: 'GET',
    params: ['clusterUuid', 'apiGroup'],
  })
  getApiResourcesList = async (config) => {
    const { clusterId, apiGroup } = config
    const url = `/clusters/${clusterId}/k8sapi/apis/${apiGroup}`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getApiResourcesList',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/clusters/{clusterUuid}/k8sapi/api/v1',
    type: 'GET',
    params: ['clusterUuid'],
  })
  getCoreApiResourcesList = async (clusterId) => {
    const url = `/clusters/${clusterId}/k8sapi/api/v1`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getCoreApiResourcesList',
      },
    })
  }
}

export default Qbert

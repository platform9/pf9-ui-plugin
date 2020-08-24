import { propOr, map, pipe, mergeLeft } from 'ramda'
import { keyValueArrToObj } from 'utils/fp'
import { pathJoin } from 'utils/misc'
import { normalizeResponse } from 'api-client/helpers'
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
} from './qbert.model'

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

/* eslint-disable camelcase */
class Qbert extends ApiService {
  public getClassName() {
    return 'qbert'
  }

  cachedEndpoint = ''

  protected async getEndpoint() {
    const endpoint = await this.client.keystone.getServiceEndpoint('qbert', 'admin')
    const mappedEndpoint = endpoint.replace(/v(1|2|3)$/, `v3/${this.client.activeProjectId}`)

    // Certain operations like column renderers from ListTable need to prepend the Qbert URL to links
    // sent from the backend.  But getting the endpoint is an async operation so we need to make an
    // sync version.  In theory this should always be set since keystone must get the service
    // catalog before any Qbert API calls are made.
    this.cachedEndpoint = mappedEndpoint
    return mappedEndpoint
  }

  monocularBaseUrl = async () => {
    return this.client.keystone.getServiceEndpoint('monocular', 'public')
  }

  baseUrl = async () => `${await this.getEndpoint()}`

  clusterBaseUrl = async (clusterId) =>
    `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1`

  clusterMonocularBaseUrl = async (clusterId, version = 'v1') =>
    pathJoin(
      await this.clusterBaseUrl(clusterId),
      'namespaces',
      'kube-system',
      'services',
      'monocular-api-svc:80',
      'proxy',
      version || '/',
    )

  /* Cloud Providers */
  getCloudProviders = async () => {
    return this.client.basicGet<GetCloudProvider[]>(
      this.getClassName(),
      'getCloudProviders',
      `${await this.baseUrl()}/cloudProviders`,
    )
  }

  createCloudProvider = async (params) => {
    return this.client.basicPost(
      this.getClassName(),
      'createCloudProvider',
      `${await this.baseUrl()}/cloudProviders`,
      params,
    )
  }

  getCloudProviderDetails = async (cpId) => {
    return this.client.basicGet(
      this.getClassName(),
      'getCloudProviderDetails',
      `${await this.baseUrl()}/cloudProviders/${cpId}`,
    )
  }

  getCloudProviderRegionDetails = async (cpId, regionId) => {
    return this.client.basicGet(
      this.getClassName(),
      'getCloudProviderRegionDetails',
      `${await this.baseUrl()}/cloudProviders/${cpId}/region/${regionId}`,
    )
  }

  updateCloudProvider = async (cpId, params) => {
    return this.client.basicPut(
      this.getClassName(),
      'updateCloudProvider',
      `${await this.baseUrl()}/cloudProviders/${cpId}`,
      params,
    )
  }

  deleteCloudProvider = async (cpId) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteCloudProvider',
      `${await this.baseUrl()}/cloudProviders/${cpId}`,
    )
  }

  cloudProviders = {
    create: this.createCloudProvider.bind(this),
    list: this.getCloudProviders.bind(this),
    details: this.getCloudProviderDetails.bind(this),
    regionDetails: this.getCloudProviderDetails.bind(this),
    update: this.updateCloudProvider.bind(this),
    delete: this.deleteCloudProvider.bind(this),
  }

  /* Cloud Providers Types */
  getCloudProviderTypes = async () => {
    return this.client.basicGet(
      this.getClassName(),
      'getCloudProviderTypes',
      `${await this.baseUrl()}/cloudProvider/types`,
    )
  }

  /* Node Pools */
  getNodePools = async () => {
    const nodePools = await this.client.basicGet(
      this.getClassName(),
      'getNodePools',
      `${await this.baseUrl()}/nodePools`,
    )
    return nodePools
  }

  /* Nodes */
  getNodes = async () => {
    const nodes = await this.client.basicGet<Node[]>(
      this.getClassName(),
      'getNodes',
      `${await this.baseUrl()}/nodes`,
    )
    return nodes
  }

  nodes = {
    list: this.getNodes,
  }

  /* SSH Keys */
  importSshKey = async (cpId, regionId, body) => {
    return this.client.basicPost(
      this.getClassName(),
      'importSshKey',
      `${await this.baseUrl()}/cloudProviders/${cpId}/region/${regionId}`,
    )
  }

  /* Clusters */
  getClusters = async () => {
    const rawClusters = await this.client.basicGet<ClusterElement[]>(
      this.getClassName(),
      'getClusters',
      `${await this.baseUrl()}/clusters`,
    )
    const baseUrl = await this.baseUrl()
    return rawClusters.map(normalizeCluster<ClusterElement>(baseUrl))
  }

  getClusterDetails = async (clusterId) => {
    const cluster = await this.client.basicGet(
      this.getClassName(),
      'getClusterDetails',
      `${await this.baseUrl()}/clusters/${clusterId}`,
    )
    const baseUrl = await this.baseUrl()
    return normalizeCluster(baseUrl)(cluster)
  }

  createCluster = async (params) => {
    // Note: This API response only returns new `uuid` in the response.
    // You might want to do a GET afterwards if you need any of the cluster information.
    return this.client.basicPost(
      this.getClassName(),
      'createCluster',
      `${await this.baseUrl()}/clusters`,
      params,
    )
  }

  updateCluster = async (clusterId, params) => {
    return this.client.basicPut(
      this.getClassName(),
      'updateCluster',
      `${await this.baseUrl()}/clusters/${clusterId}`,
      params,
    )
  }

  upgradeCluster = async (clusterId) => {
    return this.client.basicPost(
      this.getClassName(),
      'upgradeCluster',
      `${await this.baseUrl()}/clusters/${clusterId}/upgrade`,
    )
  }

  deleteCluster = async (clusterId) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteCluster',
      `${await this.baseUrl()}/clusters/${clusterId}`,
    )
  }

  clusters = {
    list: this.getClusters,
  }

  // @param clusterId = cluster.uuid
  // @param nodes = [{ uuid: node.uuid, isMaster: (true|false) }]
  attach = async (clusterId, nodes) => {
    return this.client.basicPost(
      this.getClassName(),
      'attach',
      `${await this.baseUrl()}/clusters/${clusterId}/attach`,
      nodes,
    )
  }

  // @param clusterId = cluster.uuid
  // @param nodes = [node1Uuid, node2Uuid, ...]
  detach = async (clusterId, nodeUuids) => {
    const body = nodeUuids.map((uuid) => ({ uuid }))
    return this.client.basicPost(
      this.getClassName(),
      'detach',
      `${await this.baseUrl()}/clusters/${clusterId}/detach`,
      body,
    )
  }

  getCliToken = async (clusterId, namespace) => {
    const response = await this.client.basicPost<any>(
      this.getClassName(),
      'getCliToken',
      `${await this.baseUrl()}/webcli/${clusterId}`,
      {
        namespace,
      },
    )
    return response.token
  }

  getKubeConfig = async (clusterId) => {
    return this.client.basicGet<string>(
      this.getClassName(),
      'getKubeConfig',
      `${await this.baseUrl()}/kubeconfig/${clusterId}`,
    )
  }

  /* k8s API */
  getKubernetesVersion = async (clusterId) => {
    return this.client.basicGet<GetKubernetesVersion>(
      this.getClassName(),
      'getKubernetesVersion',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/version`,
    )
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

  getClusterNamespaces = async (clusterId) => {
    const data = await this.client.basicGet<GetClusterNamespaces>(
      this.getClassName(),
      'getClusterNamespaces',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces`,
    )
    return data.items.map(this.convertResource<GetClusterNamespacesItem>(clusterId))
  }

  createNamespace = async (clusterId, body) => {
    const raw = await this.client.basicPost<any>(
      this.getClassName(),
      'createNamespace',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces`,
      body,
    )
    return this.convertResource(clusterId)(raw)
  }

  deleteNamespace = async (clusterId, namespaceName) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteNamespace',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespaceName}`,
    )
  }

  getClusterPods = async (clusterId) => {
    const data = await this.client.basicGet<GetClusterPods>(
      this.getClassName(),
      'getClusterPods',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/pods`,
    )
    return data.items.map(this.convertResource(clusterId))
  }

  getClusterDeployments = async (clusterId) => {
    const data = await this.client.basicGet<GetClusterDeployments>(
      this.getClassName(),
      'getClusterDeployments',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/apps/v1/deployments`,
    )
    return data.items.map(this.convertResource(clusterId))
  }

  deleteDeployment = async (clusterId, namespace, name) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteDeployment',
      `${await this.baseUrl()}}/k8sapi/apis/apps/v1/namespaces/${namespace}/deployments/${name}`,
    )
  }

  getClusterKubeServices = async (clusterId) => {
    const data = await this.client.basicGet<GetClusterKubeServices>(
      this.getClassName(),
      'getClusterKubeServices',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/services`,
    )
    return data.items.map(this.convertResource<GetClusterKubeServicesItem>(clusterId))
  }

  getClusterStorageClasses = async (clusterId) => {
    const data = await this.client.basicGet<GetCluster>(
      this.getClassName(),
      'getClusterStorageClasses',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/storage.k8s.io/v1/storageclasses`,
    )
    return data.items.map(this.convertResource(clusterId))
  }

  createStorageClass = async (clusterId, body) => {
    return this.client.basicPost(
      this.getClassName(),
      'createStorageClass',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/storage.k8s.io/v1/storageclasses`,
      body,
    )
  }

  deleteStorageClass = async (clusterId, name) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteStorageClass',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/storage.k8s.io/v1/storageclasses/${name}`,
    )
  }

  getReplicaSets = async (clusterId) => {
    return this.client.basicGet(
      this.getClassName(),
      'getReplicaSets',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/apps/v1/replicasets`,
    )
  }

  createPod = async (clusterId, namespace, params) => {
    return this.client.basicPost(
      this.getClassName(),
      'createPod',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/pods`,
      params,
    )
  }

  deletePod = async (clusterId, namespace, name) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deletePod',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/pods/${name}`,
    )
  }

  pods = {
    create: this.createPod.bind(this),
    list: this.getClusterPods.bind(this),
    delete: this.deletePod.bind(this),
  }

  createDeployment = async (clusterId, namespace, params) => {
    return this.client.basicPost(
      this.getClassName(),
      'createDeployment',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/apps/v1/namespaces/${namespace}/deployments`,
      params,
    )
  }

  deployments = {
    create: this.createDeployment.bind(this),
    list: this.getClusterDeployments.bind(this),
    delete: this.deleteDeployment.bind(this),
  }

  createService = async (clusterId, namespace, params) => {
    return this.client.basicPost(
      this.getClassName(),
      'createService',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/services`,
      params,
    )
  }

  deleteService = async (clusterId, namespace, name) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteService',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/services/${name}`,
    )
  }

  services = {
    create: this.createService.bind(this),
    list: this.getClusterKubeServices.bind(this),
    delete: this.deleteService.bind(this),
  }

  createServiceAccount = async (clusterId, namespace, params) => {
    return this.client.basicPost(
      this.getClassName(),
      'createServiceAccount',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/serviceaccounts`,
    )
  }

  /* Monocular endpoints being exposed through Qbert */
  getCharts = async (clusterId) => {
    const response = await this.client.basicGet(
      this.getClassName(),
      'getCharts',
      `${await this.clusterMonocularBaseUrl(clusterId)}/charts`,
    )
    return normalizeResponse(response)
  }

  getChart = async (clusterId, chart, release, version) => {
    const versionStr = version ? `versions/${version}` : ''
    return this.client.basicGet(
      this.getClassName(),
      'getChart',
      `${await this.clusterMonocularBaseUrl(clusterId)}/charts/${release}/${chart}/${versionStr}`,
    )
  }

  getChartReadmeContents = async (clusterId, readmeUrl) => {
    return this.client.basicGet(
      this.getClassName(),
      'getChartReadmeContents',
      pathJoin(await this.clusterMonocularBaseUrl(clusterId, null), readmeUrl),
    )
  }

  getChartVersions = async (clusterId, chart, release) => {
    return this.client.basicGet(
      this.getClassName(),
      'getChartVersions',
      `${await this.clusterMonocularBaseUrl(clusterId)}/charts/${release}/${chart}/versions`,
    )
  }

  getReleases = async (clusterId) => {
    const response = await this.client.basicGet(
      this.getClassName(),
      'getReleases',
      `${await this.clusterMonocularBaseUrl(clusterId)}/releases`,
    )
    return normalizeResponse(response)
  }

  getRelease = async (clusterId, name) => {
    const response = await this.client.basicGet(
      this.getClassName(),
      'getRelease',
      `${await this.clusterMonocularBaseUrl(clusterId)}/releases/${name}`,
    )
    return normalizeResponse(response)
  }

  deleteRelease = async (clusterId, name) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteRelease',
      `${await this.clusterMonocularBaseUrl(clusterId)}/releases/${name}`,
    )
  }

  deployApplication = async (clusterId, body) => {
    return this.client.basicPost(
      this.getClassName(),
      'deployApplication',
      `${await this.clusterMonocularBaseUrl(clusterId)}/releases`,
      body,
    )
  }

  getRepositories = async () => {
    return this.client.basicGet(
      this.getClassName(),
      'getRepositories',
      `${await this.monocularBaseUrl()}/repos`,
    )
  }

  getRepositoriesForCluster = async (clusterId) => {
    return this.client.basicGet(
      this.getClassName(),
      'getRepositoriesForCluster',
      `${await this.clusterMonocularBaseUrl(clusterId)}/repos`,
    )
  }

  createRepository = async (body) => {
    return this.client.basicPost(
      this.getClassName(),
      'createRepository',
      `${await this.monocularBaseUrl()}/repos`,
      body,
    )
  }

  createRepositoryForCluster = async (clusterId, body) => {
    return this.client.basicPost(
      this.getClassName(),
      'createRepositoryForCluster',
      `${await this.clusterMonocularBaseUrl(clusterId)}/repos`,
      body,
    )
  }

  deleteRepository = async (repoId) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteRepository',
      `${await this.monocularBaseUrl()}/repos/${repoId}`,
    )
  }

  deleteRepositoriesForCluster = async (clusterId, repoId) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteRepositoriesForCluster',
      `${await this.clusterMonocularBaseUrl(clusterId)}/repos/${repoId}`,
    )
  }

  getServiceAccounts = async (clusterId, namespace) => {
    const response = await this.client.basicGet<any>(
      this.getClassName(),
      'getServiceAccounts',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/serviceaccounts`,
    )
    return response && response.items
  }

  /* RBAC */
  getClusterRoles = async (clusterId) => {
    const response = await this.client.basicGet<GetClusterRoles>(
      this.getClassName(),
      'getClusterRoles',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/roles`,
    )
    return normalizeClusterizedResponse<GetClusterRolesItem>(clusterId, response)
  }

  createClusterRole = async (clusterId, namespace, body) => {
    const response = await this.client.basicPost(
      this.getClassName(),
      'createClusterRole',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles`,
      body,
    )
    return normalizeClusterizedUpdate(clusterId, response)
  }

  updateClusterRole = async (clusterId, namespace, name, body) => {
    const response = await this.client.basicPut(
      this.getClassName(),
      'updateClusterRole',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles/${name}`,
      body,
    )
    return normalizeClusterizedUpdate(clusterId, response)
  }

  deleteClusterRole = async (clusterId, namespace, name) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteClusterRole',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles/${name}`,
    )
  }

  getClusterClusterRoles = async (clusterId) => {
    const response = await this.client.basicGet<GetClusterClusterRoles>(
      this.getClassName(),
      'getClusterClusterRoles',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterroles`,
    )
    return normalizeClusterizedResponse(clusterId, response)
  }

  createClusterClusterRole = async (clusterId, body) => {
    const response = await this.client.basicPost(
      this.getClassName(),
      'createClusterClusterRole',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterroles`,
      body,
    )
    return normalizeClusterizedUpdate(clusterId, response)
  }

  updateClusterClusterRole = async (clusterId, name, body) => {
    const response = await this.client.basicPut(
      this.getClassName(),
      'updateClusterClusterRole',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterroles/${name}`,
      body,
    )
    return normalizeClusterizedUpdate(clusterId, response)
  }

  deleteClusterClusterRole = async (clusterId, name) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteClusterClusterRole',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterroles/${name}`,
    )
  }

  getClusterRoleBindings = async (clusterId) => {
    const response = await this.client.basicGet<GetCluster>(
      this.getClassName(),
      'getClusterRoleBindings',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/rolebindings`,
    )
    return normalizeClusterizedResponse(clusterId, response)
  }

  createClusterRoleBinding = async (clusterId, namespace, body) => {
    const response = await this.client.basicPost(
      this.getClassName(),
      'createClusterRoleBinding',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/rolebindings`,
      body,
    )
    return normalizeClusterizedUpdate(clusterId, response)
  }

  updateClusterRoleBinding = async (clusterId, namespace, name, body) => {
    const response = await this.client.basicPut(
      this.getClassName(),
      'updateClusterRoleBinding',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/rolebindings/${name}`,
      body,
    )
    return normalizeClusterizedUpdate(clusterId, response)
  }

  deleteClusterRoleBinding = async (clusterId, namespace, name) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteClusterRoleBinding',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/rolebindings/${name}`,
    )
  }

  getClusterClusterRoleBindings = async (clusterId) => {
    const response = await this.client.basicGet<GetCluster>(
      this.getClassName(),
      'getClusterClusterRoleBindings',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterrolebindings`,
    )
    return normalizeClusterizedResponse(clusterId, response)
  }

  createClusterClusterRoleBinding = async (clusterId, body) => {
    const response = await this.client.basicPost(
      this.getClassName(),
      'createClusterClusterRoleBinding',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterrolebindings`,
      body,
    )
    return normalizeClusterizedUpdate(clusterId, response)
  }

  updateClusterClusterRoleBinding = async (clusterId, name, body) => {
    const response = await this.client.basicPut(
      this.getClassName(),
      'updateClusterClusterRoleBinding',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/${name}`,
      body,
    )
    return normalizeClusterizedUpdate(clusterId, response)
  }

  deleteClusterClusterRoleBinding = async (clusterId, name) => {
    return this.client.basicDelete(
      this.getClassName(),
      'deleteClusterClusterRoleBinding',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/${name}`,
    )
  }

  /* Managed Apps */
  getPrometheusInstances = async (clusterUuid) => {
    const response = await this.client.basicGet<any>(
      this.getClassName(),
      'getPrometheusInstances',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/prometheuses`,
    )
    return normalizeClusterizedResponse(clusterUuid, response)
  }

  updatePrometheusInstance = async (data) => {
    const { clusterUuid, namespace, name } = data
    const body = [
      { op: 'replace', path: '/spec/replicas', value: data.replicas },
      { op: 'replace', path: '/spec/retention', value: data.retention },
      { op: 'replace', path: '/spec/resources/requests/cpu', value: data.cpu },
      { op: 'replace', path: '/spec/resources/requests/memory', value: data.memory },
    ]
    const response = await this.client.basicPatch(
      this.getClassName(),
      'updatePrometheusInstance',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheuses/${name}`,
      body,
    )
    return normalizeClusterizedUpdate(clusterUuid, response)
  }

  deletePrometheusInstance = async (clusterUuid, namespace, name) => {
    await this.client.basicDelete(
      this.getClassName(),
      'deletePrometheusInstance',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheuses/${name}`,
    )
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

    const response = await this.client.basicPost(
      this.getClassName(),
      'createPrometheusInstance',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${
        data.namespace
      }/prometheuses`,
      prometheusBody,
    )
    await this.client.basicPost(
      this.getClassName(),
      'createPrometheusInstance/servicemonitors',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${
        data.namespace
      }/servicemonitors`,
      serviceMonitorBody,
    )
    await this.client.basicPost(
      this.getClassName(),
      'createPrometheusInstance/prometheusrules',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${
        data.namespace
      }/prometheusrules`,
      prometheusRulesBody,
    )
    // this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/monitoring.coreos.com/v1/alertmanagers`, alertManagerBody)
    return response
  }

  getPrometheusAlerts = async (clusterUuid) => {
    const response = await this.client.basicGet<GetPrometheusAlerts>(
      this.getClassName(),
      'getPrometheusAlerts',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-prometheus:9090/proxy/api/v1/rules`,
    )
    const alerts = response.groups
      .flatMap((group) => {
        return group.rules
      })
      .filter((rule) => rule.type === 'alerting')
    return alerts.map((alert) => ({
      ...alert,
      clusterId: clusterUuid,
      id: `${alert.name}${clusterUuid}${alert.labels.severity}`,
    }))
  }

  getPrometheusAlertsOverTime = async (clusterUuid, startTime, endTime, step) => {
    const response = await this.client.basicGet<GetPrometheusAlertsOverTime>(
      this.getClassName(),
      'getPrometheusAlertsOverTime',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:sys-prometheus:9090/proxy/api/v1/query_range?query=ALERTS&start=${startTime}&end=${endTime}&step=${step}`,
    )
    return response.result.map((alert) => ({
      ...alert,
      clusterId: clusterUuid,
      id: `${alert.metric.alertname}${clusterUuid}`,
    }))
  }

  getPrometheusServiceMonitors = async (clusterUuid) => {
    const response = await this.client.basicGet<any>(
      this.getClassName(),
      'getPrometheusServiceMonitors',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/servicemonitors`,
    )
    return normalizeClusterizedResponse(clusterUuid, response)
  }

  updatePrometheusServiceMonitor = async (data) => {
    const { clusterUuid, namespace, name } = data
    const body = [
      {
        op: 'replace',
        path: '/metadata/labels',
        value: data.labels,
      },
    ]
    const response = await this.client.basicPatch(
      this.getClassName(),
      'updatePrometheusServiceMonitor',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/servicemonitors/${name}`,
      body,
    )
    return normalizeClusterizedUpdate(clusterUuid, response)
  }

  deletePrometheusServiceMonitor = async (clusterUuid, namespace, name) => {
    await this.client.basicDelete(
      this.getClassName(),
      'deletePrometheusServiceMonitor',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/servicemonitors/${name}`,
    )
  }

  getPrometheusRules = async (clusterUuid) => {
    const response = await this.client.basicGet<any>(
      this.getClassName(),
      'getPrometheusRules',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/prometheusrules`,
    )
    return normalizeClusterizedResponse(clusterUuid, response)
  }

  updatePrometheusRules = async (rulesObject) => {
    const { clusterUuid, namespace, name } = rulesObject
    const body = [
      {
        op: 'replace',
        path: '/spec/groups/0/rules',
        value: rulesObject.rules,
      },
    ]
    const response = await this.client.basicPatch(
      this.getClassName(),
      'updatePrometheusRules',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheusrules/${name}`,
      body,
    )
    return normalizeClusterizedUpdate(clusterUuid, response)
  }

  deletePrometheusRule = async (clusterUuid, namespace, name) => {
    await this.client.basicDelete(
      this.getClassName(),
      'deletePrometheusRule',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheusrules/${name}`,
    )
  }

  getPrometheusAlertManagers = async (clusterUuid) => {
    const response = await this.client.basicGet<any>(
      this.getClassName(),
      'getPrometheusAlertManagers',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/alertmanagers`,
    )
    return normalizeClusterizedResponse(clusterUuid, response)
  }

  updatePrometheusAlertManager = async (data) => {
    const { clusterUuid, namespace, name } = data
    const body = [{ op: 'replace', path: '/spec/replicas', value: data.replicas }]
    const response = await this.client.basicPatch(
      this.getClassName(),
      'updatePrometheusAlertManager',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/alertmanagers/${name}`,
      body,
    )
    return normalizeClusterizedUpdate(clusterUuid, response)
  }

  deletePrometheusAlertManager = async (clusterUuid, namespace, name) => {
    await this.client.basicDelete(
      this.getClassName(),
      'deletePrometheusAlertManager',
      `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/alertmanagers/${name}`,
    )
  }

  getPrometheusDashboardLink = (instance) =>
    `${this.cachedEndpoint}/clusters/${instance.clusterUuid}/k8sapi${instance.dashboard}`

  // TODO: Loggings
  getLoggingsBaseUrl = async (clusterUuid) =>
    `${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/logging.pf9.io/v1alpha1/outputs`

  getLoggings = async (clusterUuid) => {
    const url = await this.getLoggingsBaseUrl(clusterUuid)
    return this.client.basicGet(this.getClassName(), 'getLoggings', url)
  }

  createLogging = async (clusterUuid, logging) => {
    const url = await this.getLoggingsBaseUrl(clusterUuid)
    const response = await this.client.basicPost(this.getClassName(), 'createLogging', url, logging)
    return response
  }

  updateLogging = async (clusterUuid, logging) => {
    const url = `${await this.getLoggingsBaseUrl(clusterUuid)}/${logging.uuid}`
    return this.client.basicPut<{ id: string }>(this.getClassName(), 'updateLogging', url, logging)
    // TODO use models on basic methods
  }

  deleteLogging = async (clusterUuid, loggingUuid) => {
    const url = `${await this.getLoggingsBaseUrl(clusterUuid)}/${loggingUuid}`
    return this.client.basicDelete(this.getClassName(), 'deleteLogging', url)
  }

  // API Resources
  getApiGroupList = async (clusterId) => {
    return this.client.basicGet(
      this.getClassName(),
      'getApiGroupList',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis`,
    )
  }

  getApiResourcesList = async (config) => {
    const { clusterId, apiGroup } = config
    return this.client.basicGet(
      this.getClassName(),
      'getApiResourcesList',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/${apiGroup}`,
    )
  }

  getCoreApiResourcesList = async (clusterId) => {
    return this.client.basicGet(
      this.getClassName(),
      'getCoreApiResourcesList',
      `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1`,
    )
  }
}

export default Qbert

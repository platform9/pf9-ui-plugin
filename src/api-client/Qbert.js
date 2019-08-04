import { assoc, propOr } from 'ramda'
import { keyValueArrToObj } from 'utils/fp'

const normalizePrometheusResponse = (clusterUuid, response) => propOr([], 'items', response).map(x => ({ ...x, clusterUuid }))
const normalizePrometheusUpdate = (clusterUuid, response) => ({ ...response, clusterUuid })

/* eslint-disable camelcase */
class Qbert {
  constructor (client) {
    this.client = client
    this.cachedEndpoint = ''
  }

  endpoint = async () => {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.qbert.admin.url
    const mappedEndpoint = endpoint.replace(/v(1|2|3)$/, `v3/${this.client.activeProjectId}`)

    // Certain operations like column renderers from ListTable need to prepend the Qbert URL to links
    // sent from the backend.  But getting the endpoint is an async operation so we need to make an
    // sync version.  In theory this should always be set since keystone must get the service
    // catalog before any Qbert API calls are made.
    this.cachedEndpoint = mappedEndpoint
    return mappedEndpoint
  }

  monocularBaseUrl = async () => {
    const services = await this.client.keystone.getServicesForActiveRegion()
    return services.monocular.public.url
  }

  baseUrl = async () => `${await this.endpoint()}`

  clusterBaseUrl = async clusterId => `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1`
  clusterMonocularBaseUrl = async clusterId => `${await this.clusterBaseUrl(clusterId)}/namespaces/kube-system/services/monocular-api-svc:80/proxy/v1`

  /* Cloud Providers */
  getCloudProviders = async () => {
    return this.client.basicGet(`${await this.baseUrl()}/cloudProviders`)
  }

  createCloudProvider = async (params) => {
    return this.client.basicPost(`${await this.baseUrl()}/cloudProviders`, params)
  }

  getCloudProviderDetails = async (cpId) => {
    return this.client.basicGet(`${await this.baseUrl()}/cloudProviders/${cpId}`)
  }

  getCloudProviderRegionDetails = async (cpId, regionId) => {
    return this.client.basicGet(`${await this.baseUrl()}/cloudProviders/${cpId}/region/${regionId}`)
  }

  updateCloudProvider = async (cpId, params) => {
    return this.client.basicPut(`${await this.baseUrl()}/cloudProviders/${cpId}`, params)
  }

  deleteCloudProvider = async (cpId) => {
    return this.client.basicDelete(`${await this.baseUrl()}/cloudProviders/${cpId}`)
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
    return this.client.basicGet(`${await this.baseUrl()}/cloudProvider/types`)
  }

  /* Nodes */
  getNodes = async () => {
    const nodes = await this.client.basicGet(`${await this.baseUrl()}/nodes`)
    return nodes
  }

  nodes = {
    list: this.getNodes,
  }

  /* SSH Keys */
  importSshKey = async (cpId, regionId, body) => {
    return this.client.basicPost(`${await this.baseUrl()}/cloudProviders/${cpId}/region/${regionId}`)
  }

  /* Clusters */
  getClusters = async () => {
    const rawClusters = await this.client.basicGet(`${await this.baseUrl()}/clusters`)
    const baseUrl = await this.baseUrl()
    return rawClusters.map(cluster => ({
      ...cluster,
      endpoint: cluster.externalDnsName || cluster.masterIp,
      kubeconfigUrl: `${baseUrl}/kubeconfig/${cluster.uuid}`,
      isUpgrading: cluster.taskStatus === 'upgrading',
      nodes: [],
    }))
  }

  getClusterDetails = async (clusterId) => {
    return this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}`)
  }

  createCluster = async (params) => {
    return this.client.basicPost(`${await this.baseUrl()}/clusters`, params)
  }

  updateCluster = async (clusterId, params) => {
    return this.client.basicPut(`${await this.baseUrl()}/clusters/${clusterId}`, params)
  }

  upgradeCluster = async (clusterId) => {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/upgrade`)
  }

  deleteCluster = async (clusterId) => {
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterId}`)
  }

  clusters = {
    list: this.getClusters,
  }

  // @param clusterId = cluster.uuid
  // @param nodes = [{ uuid: node.uuid, isMaster: (true|false) }]
  attach = async (clusterId, nodes) => {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/attach`, nodes)
  }

  // @param clusterId = cluster.uuid
  // @param nodes = [node1Uuid, node2Uuid, ...]
  detach = async (clusterId, nodeUuids) => {
    const body = nodeUuids.map(uuid => ({ uuid }))
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/detach`, body)
  }

  getCliToken = async (clusterId, namespace) => {
    const response = await this.client.basicPost(`${await this.baseUrl()}/webcli/${clusterId}`, { namespace })
    return response.token
  }

  getKubeConfig = async (clusterId) => {
    return this.client.basicGet(`${await this.baseUrl()}/kubeconfig/${clusterId}`)
  }

  /* k8s API */
  getKubernetesVersion = async (clusterId) => {
    return this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/version`)
  }

  convertResource = clusterId => cluster => ({
    ...cluster,
    clusterId,
    name: cluster.metadata.name,
    created: cluster.metadata.creationTimestamp,
    id: cluster.metadata.uid,
    namespace: cluster.metadata.namespace,
  })

  getClusterNamespaces = async (clusterId) => {
    try {
      const data = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces`)

      return data.items.map(this.convertResource(clusterId))
    } catch (err) {
      console.log(`Error getting cluster namespaces for clusterId: ${clusterId}`)
      return []
    }
  }

  createNamespace = async (clusterId, body) => {
    const raw = await this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces`, body)
    const converted = this.convertResource(clusterId)(raw)
    return converted
  }

  deleteNamespace = async (clusterId, namespaceName) => {
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespaceName}`)
  }

  getClusterPods = async (params) => {
    const { clusterId } = params
    try {
      const data = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/pods`)
      return data.items.map(this.convertResource(clusterId))
    } catch (err) {
      console.error(`Error getting cluster pods for clusterId: ${clusterId}`)
      return err
    }
  }

  getClusterDeployments = async (params) => {
    const { clusterId } = params
    try {
      const data = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/extensions/v1beta1/deployments`)
      return data.items.map(this.convertResource(clusterId))
    } catch (err) {
      console.error(`Error getting cluster deployments for clusterId: ${clusterId}`)
      return err
    }
  }

  deleteDeployment = async (clusterId, namespace, name) => {
    return this.client.basicDelete(`${await this.baseUrl()}}/k8sapi/apis/extensions/v1beta1/namespaces/${namespace}/deployments/${name}`)
  }

  getClusterKubeServices = async (params) => {
    const { clusterId } = params
    try {
      const data = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/services`)
      return data.items.map(this.convertResource(clusterId))
    } catch (err) {
      console.error(`Error getting cluster services for clusterId: ${clusterId}`)
      return err
    }
  }

  getClusterStorageClasses = async (clusterId) => {
    try {
      const data = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/storage.k8s.io/v1/storageclasses`)
      const mapStorageClass = sc => assoc('type', sc.parameters.type, sc)
      return data.items.map(this.convertResource(clusterId)).map(mapStorageClass)
    } catch (err) {
      console.error(`Error getting cluster storage classes for clusterId: ${clusterId}`, err)
      return []
    }
  }

  createStorageClass = async (clusterId, params) => {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/storage.k8s.io/v1/storageclasses`)
  }

  deleteStorageClass = async (clusterId, name) => {
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/storage.k8s.io/v1/storageclasses/${name}`)
  }

  getReplicaSets = async (clusterId) => {
    return this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/extensions/v1beta1/replicasets`)
  }

  createPod = async (clusterId, namespace, params) => {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/pods`, params)
  }

  deletePod = async (clusterId, namespace, name) => {
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/pods/${name}`)
  }

  pods = {
    create: this.createPod.bind(this),
    list: this.getClusterPods.bind(this),
    delete: this.deletePod.bind(this),
  }

  createDeployment = async (clusterId, namespace, params) => {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/extensions/v1beta1/namespaces/${namespace}/deployments`, params)
  }

  deployments = {
    create: this.createDeployment.bind(this),
    list: this.getClusterDeployments.bind(this),
    delete: this.deleteDeployment.bind(this),
  }

  createService = async (clusterId, namespace, params) => {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/services`, params)
  }

  deleteService = async (clusterId, namespace, name) => {
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/services/${name}`)
  }

  services = {
    create: this.createService.bind(this),
    list: this.getClusterKubeServices.bind(this),
    delete: this.deleteService.bind(this),
  }

  createServiceAccount = async (clusterId, namespace, params) => {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/serviceaccounts`)
  }

  /* Monocular endpoints being exposed through Qbert */
  getCharts = async (clusterId) => {
    const output = await this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/charts`)
    // FIXME: remove this when api is fixed (right now it is returning data.data)
    return output && output.hasOwnProperty('data') ? output.data : output || []
  }

  getChart = async (clusterId, chart, release, version) => {
    const versionStr = version ? `/versions/${version}` : ''
    return this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/charts/${chart}/${release}/${versionStr}`)
  }

  getChartVersions = async (clusterId, chart, release) => {
    return this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/charts/${chart}/${release}/versions`)
  }

  getReleases = async (clusterId) => {
    const output = await this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/releases`)
    // FIXME: remove this when api is fixed (right now it is returning data.data)
    return output && output.hasOwnProperty('data') ? output.data : output || []
  }

  getRelease = async (clusterId, name) => {
    const output = await this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/releases/${name}`)
    // FIXME: remove this when api is fixed (right now it is returning data.data)
    return output && output.hasOwnProperty('data') ? output.data : output || []
  }

  deleteRelease = async (clusterId, name) => {
    return this.client.basicDelete(`${await this.clusterMonocularBaseUrl(clusterId)}/releases/${name}`)
  }

  deployApplication = async (clusterId, body) => {
    return this.client.basicPost(`${await this.clusterMonocularBaseUrl(clusterId)}/releases`, body)
  }

  getRepositories = async () => {
    return this.client.basicGet(`${await this.monocularBaseUrl()}/repos`)
  }

  getRepositoriesForCluster = async (clusterId) => {
    return this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/repos`)
  }

  createRepository = async (body) => {
    return this.client.basicPost(`${this.monocularBaseUrl()}/repos`, body)
  }

  createRepositoryForCluster = async (clusterId, body) => {
    return this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/repos`, body)
  }

  deleteRepository = async (repoId) => {
    return this.client.basicDelete(`${this.monocularBaseUrl()}/repos/${repoId}`)
  }

  deleteRepositoriesForCluster = async (clusterId, repoId) => {
    return this.client.basicDelete(`${await this.clusterMonocularBaseUrl(clusterId)}/repos/${repoId}`)
  }

  getServiceAccounts = async (clusterId, namespace) => {
    const response = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/serviceaccounts`)
    return response && response.items
  }

  /* Managed Apps */
  getPrometheusInstances = async (clusterUuid) => {
    const response = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/prometheuses`)
    return normalizePrometheusResponse(clusterUuid, response)
  }

  updatePrometheusInstance = async data => {
    const { clusterUuid, namespace, name } = data
    const body = [
      { op: 'replace', path: '/spec/replicas', value: data.replicas },
      { op: 'replace', path: '/spec/retention', value: data.retention },
      { op: 'replace', path: '/spec/resources/requests/cpu', value: data.cpu },
      { op: 'replace', path: '/spec/resources/requests/memory', value: data.memory },
    ]
    const response = await this.client.basicPatch(`${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheuses/${name}`, body)
    return normalizePrometheusUpdate(clusterUuid, response)
  }

  deletePrometheusInstance = async (clusterUuid, namespace, name) => {
    const response = await this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheuses/${name}`)
    return response
  }

  createPrometheusInstance = async (clusterId, data) => {
    const requests = {}
    if (data.cpu) { requests.cpu = data.cpu }
    if (data.memory) { requests.memory = data.memory }
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

    let prometheusBody = {
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

    let serviceMonitorBody = {
      apiVersion,
      kind: 'ServiceMonitor',
      metadata: {
        name: `${data.name}-service-monitor`,
        namespace: data.namespace,
        labels: serviceMonitor,
      },
      spec: {
        endpoints: [
          { port: data.port },
        ],
        selector: { matchLabels: appLabels },
      },
    }

    /*
    let alertManagerBody = {
      // TODO: what goes in here
    }
    */

    let prometheusRulesBody = {
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

    const response = await this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${data.namespace}/prometheuses`, prometheusBody)
    this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${data.namespace}/servicemonitors`, serviceMonitorBody)
    this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${data.namespace}/prometheusrules`, prometheusRulesBody)
    // this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/monitoring.coreos.com/v1/alertmanagers`, alertManagerBody)
    return response
  }

  getPrometheusServiceMonitors = async (clusterUuid) => {
    const response = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/servicemonitors`)
    return normalizePrometheusResponse(clusterUuid, response)
  }

  updatePrometheusServiceMonitor = async data => {
    const { clusterUuid, namespace, name } = data
    const body = [{
      op: 'replace',
      path: '/metadata/labels',
      value: data.labels,
    }]
    const response = await this.client.basicPatch(`${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/servicemonitors/${name}`, body)
    return normalizePrometheusUpdate(clusterUuid, response)
  }

  deletePrometheusServiceMonitor = async (clusterUuid, namespace, name) => {
    const response = await this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/servicemonitors/${name}`)
    return response
  }

  getPrometheusRules = async (clusterUuid) => {
    const response = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/prometheusrules`)
    return normalizePrometheusResponse(clusterUuid, response)
  }

  updatePrometheusRules = async rulesObject => {
    const { clusterUuid, namespace, name } = rulesObject
    const body = [{
      op: 'replace',
      path: '/spec/groups/0/rules',
      value: rulesObject.rules,
    }]
    const response = await this.client.basicPatch(`${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheusrules/${name}`, body)
    return normalizePrometheusUpdate(clusterUuid, response)
  }

  deletePrometheusRule = async (clusterUuid, namespace, name) => {
    const response = await this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheusrules/${name}`)
    return response
  }

  getPrometheusAlertManagers = async (clusterUuid) => {
    const response = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/alertmanagers`)
    return normalizePrometheusResponse(clusterUuid, response)
  }

  updatePrometheusAlertManager = async data => {
    const { clusterUuid, namespace, name } = data
    const body = [
      { op: 'replace', path: '/spec/replicas', value: data.replicas },
    ]
    const response = await this.client.basicPatch(`${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/alertmanagers/${name}`, body)
    return normalizePrometheusUpdate(clusterUuid, response)
  }

  deletePrometheusAlertManager = async (clusterUuid, namespace, name) => {
    const response = await this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterUuid}/k8sapi/apis/monitoring.coreos.com/v1/namespaces/${namespace}/alertmanagers/${name}`)
    return response
  }

  getPrometheusDashboardLink = instance => `${this.cachedEndpoint}/clusters/${instance.clusterUuid}/k8sapi${instance.dashboard}`
}

export default Qbert

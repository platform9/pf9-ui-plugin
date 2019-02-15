/* eslint-disable camelcase */
class Qbert {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.qbert.admin.url
    return endpoint.replace(/v(1|2|3)$/, `v3/${this.client.activeProjectId}`)
  }

  async monocularBaseUrl () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    return services.monocular.public.url
  }

  baseUrl = async () => `${await this.endpoint()}`

  clusterBaseUrl = async clusterId => `${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1`
  clusterMonocularBaseUrl = async clusterId => `${await this.clusterBaseUrl(clusterId)}/namespaces/kube-system/services/monocular-api-svc:80/proxy/v1`

  /* Cloud Providers */
  async getCloudProviders () {
    return this.client.basicGet(`${await this.baseUrl()}/cloudProviders`)
  }

  async createCloudProvider (params) {
    return this.client.basicPost(`${await this.baseUrl()}/cloudProviders`, params)
  }

  async getCloudProviderDetails (cpId) {
    return this.client.basicGet(`${await this.baseUrl()}/cloudProviders/${cpId}`)
  }

  async getCloudProviderRegionDetails (cpId, regionId) {
    return this.client.basicGet(`${await this.baseUrl()}/cloudProviders/${cpId}/region/${regionId}`)
  }

  async updateCloudProvider (cpId, params) {
    return this.client.basicPut(`${await this.baseUrl()}/cloudProviders/${cpId}`, params)
  }

  async deleteCloudProvider (cpId) {
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
  async getCloudProviderTypes () {
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
  async importSshKey (cpId, regionId, body) {
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

  async getClusterDetails (clusterId) {
    return this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}`)
  }

  async createCluster (params) {
    return this.client.basicPost(`${await this.baseUrl()}/clusters`, params)
  }

  async updateCluster (clusterId, params) {
    return this.client.basicPut(`${await this.baseUrl()}/clusters/${clusterId}`, params)
  }

  async upgradeCluster (clusterId) {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/upgrade`)
  }

  async deleteCluster (clusterId) {
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterId}`)
  }

  clusters = {
    list: this.getClusters,
  }

  // @param clusterId = cluster.uuid
  // @param nodes = [{ uuid: node.uuid, isMaster: (true|false) }]
  async attach (clusterId, nodes) {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/attach`, nodes)
  }

  async _detach (clusterId, nodeIds) { /* TODO */ }
  async detach (clusterId, nodeIds) { /* TODO */ }

  async getCliToken (clusterId, namespace) {
    const response = await this.client.basicPost(`${await this.baseUrl()}/webcli/${clusterId}`, { namespace })
    return response.token
  }

  /* k8s API */
  async getKubernetesVersion (clusterId) {
    return this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/version`)
  }

  convertCluster = clusterId => cluster => ({
    ...cluster,
    clusterId,
    name: cluster.metadata.name,
    created: cluster.metadata.creationTimestamp,
    id: cluster.metadata.uid,
    namespace: cluster.metadata.namespace,
  })

  async getClusterNamespaces (clusterId) {
    try {
      const data = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces`)

      return data.items.map(this.convertCluster(clusterId))
    } catch (err) {
      console.log(`Error getting cluster namespaces for clusterId: ${clusterId}`)
      return []
    }
  }

  async createNamespace (clusterId, body) {
    const raw = await this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces`, body)
    const converted = this.convertCluster(clusterId)(raw)
    return converted
  }

  async deleteNamespace (clusterId, namespaceName) {
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespaceName}`)
  }

  async getClusterPods (params) {
    const { clusterId } = params
    try {
      const data = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/pods`)
      return data.items.map(this.convertCluster(clusterId))
    } catch (err) {
      console.error(`Error getting cluster pods for clusterId: ${clusterId}`)
      return err
    }
  }

  async getClusterDeployments (params) {
    const { clusterId } = params
    try {
      const data = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/extensions/v1beta1/deployments`)
      return data.items.map(this.convertCluster(clusterId))
    } catch (err) {
      console.error(`Error getting cluster deployments for clusterId: ${clusterId}`)
      return err
    }
  }

  async deleteDeployment (clusterId, namespace, name) {
    return this.client.basicDelete(`${await this.baseUrl()}}/k8sapi/apis/extensions/v1beta1/namespaces/${namespace}/deployments/${name}`)
  }

  async getClusterKubeServices (params) {
    const { clusterId } = params
    try {
      const data = await this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/services`)
      return data.items.map(this.convertCluster(clusterId))
    } catch (err) {
      console.error(`Error getting cluster services for clusterId: ${clusterId}`)
      return err
    }
  }

  async getClusterStorageClasses (clusterId) {
    return this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/storage.k8s.io/v1/storageclasses`)
  }

  async createStorageClass (clusterId, params) {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/storage.k8s.io/v1/storageclasses`)
  }

  async deleteStorageClass (clusterId, name) {
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/storage.k8s.io/v1/storageclasses/${name}`)
  }

  async getReplicaSets (clusterId) {
    return this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/extensions/v1beta1/replicasets`)
  }

  async createPod (clusterId, namespace, params) {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/pods`, params)
  }

  async deletePod (clusterId, namespace, name) {
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/pods/${name}`)
  }

  pods = {
    create: this.createPod.bind(this),
    list: this.getClusterPods.bind(this),
    delete: this.deletePod.bind(this),
  }

  async createDeployment (clusterId, namespace, params) {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/extensions/v1beta1/namespaces/${namespace}/deployments`, params)
  }

  deployments = {
    create: this.createDeployment.bind(this),
    list: this.getClusterDeployments.bind(this),
    delete: this.deleteDeployment.bind(this),
  }

  async createService (clusterId, namespace, params) {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/services`, params)
  }

  async deleteService (clusterId, namespace, name) {
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/services/${name}`)
  }

  services = {
    create: this.createService.bind(this),
    list: this.getClusterKubeServices.bind(this),
    delete: this.deleteService.bind(this),
  }

  async createServiceAccount (clusterId, namespace, params) {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/serviceaccounts`)
  }

  /* Monocular endpoints being exposed through Qbert */
  async getCharts (clusterId) {
    return this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/charts`)
  }

  async getChart (clusterId, chart, release, version) {
    const versionStr = version ? `/versions/${version}` : ''
    return this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/charts/${chart}/${release}/${versionStr}`)
  }

  async getChartVersions (clusterId, chart, release) {
    return this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/charts/${chart}/${release}/versions`)
  }

  async getReleases (clusterId) {
    return this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/releases`)
  }

  async getRelease (clusterId, name) {
    return this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/releases/${name}`)
  }

  async deleteRelease (clusterId, name) {
    return this.client.basicDelete(`${await this.clusterMonocularBaseUrl(clusterId)}/releases/${name}`)
  }

  async deployApplication (clusterId, body) {
    return this.client.basicPost(`${await this.clusterMonocularBaseUrl(clusterId)}/releases`, body)
  }

  async getRepositories () {
    return this.client.basicGet(`${this.monocularBaseUrl()}/repos`)
  }

  async getRepositoriesForCluster (clusterId) {
    return this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/repos`)
  }

  async createRepository (body) {
    return this.client.basicPost(`${this.monocularBaseUrl()}/repos`, body)
  }

  async createRepositoryForCluster (clusterId, body) {
    return this.client.basicGet(`${await this.clusterMonocularBaseUrl(clusterId)}/repos`, body)
  }

  async deleteRepository (repoId) {
    return this.client.basicDelete(`${this.monocularBaseUrl()}/repos/${repoId}`)
  }

  async deleteRepositoriesForCluster (clusterId, repoId) {
    return this.client.basicDelete(`${await this.clusterMonocularBaseUrl(clusterId)}/repos/${repoId}`)
  }
}

export default Qbert

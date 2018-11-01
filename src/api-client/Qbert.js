/* eslint-disable camelcase */
class Qbert {
  constructor (client) {
    this.client = client
  }

  async endpoint () {
    const services = await this.client.keystone.getServicesForActiveRegion()
    const endpoint = services.qbert.admin.url
    return endpoint.replace(/v1$/, `v2/${this.client.activeProjectId}`)
  }

  baseUrl = async () => `${await this.endpoint()}`

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

  async attach (clusterId, nodeIds) { /* TODO */ }
  async _detach (clusterId, nodeIds) { /* TODO */ }
  async detach (clusterId, nodeIds) { /* TODO */ }

  async getCliToken (clusterId, namespace) {
    return this.client.basicPost(`${await this.baseUrl()}/webcli/${clusterId}`, { namespace })
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

  async getClusterPods (clusterId) {
    return this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/pods`)
  }

  async getClusterDeployments (clusterId) {
    return this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/extensions/v1beta1/deployments`)
  }

  async deleteDeployment (clusterId, namespace, name) {
    return this.client.basicDelete(`${await this.baseUrl()}}/k8sapi/apis/extensions/v1beta1/namespaces/${namespace}/deployments/${name}`)
  }

  async getClusterKubeServices (clusterId) {
    return this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/services`)
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

  async getRepliaceSets (clusterId) {
    return this.client.basicGet(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/extensions/v1beta1/replicasets`)
  }

  async createPod (clusterId, namespace, params) {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/v1/namespaces/${namespace}/pods`, params)
  }

  async deletePod (clusterId, namespace, name) {
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/v1/namespaces/${namespace}/pods/${name}`)
  }

  async createDeployment (clusterId, namespace, params) {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/apis/extensions/v1beta1/namespaces/${namespace}/deployments`)
  }

  async createService (clusterId, namespace, params) {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/services`)
  }

  async deleteService (clusterId, namespace, name) {
    return this.client.basicDelete(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/services/${name}`)
  }

  async createServiceAccount (clusterId, namespace, params) {
    return this.client.basicPost(`${await this.baseUrl()}/clusters/${clusterId}/k8sapi/api/v1/namespaces/${namespace}/serviceaccounts`)
  }
}

export default Qbert

import ApiService from 'api-client/ApiService'
import { createUrlWithQueryString } from 'core/utils/routes'
import config from '../../config'

class Helm extends ApiService {
  public getClassName() {
    return 'helm'
  }

  protected async getEndpoint() {
    return Promise.resolve(config.apiHost)
  }

  get baseUrl(): string {
    return 'pf9helm'
  }

  getRepository = async (repoName) => {
    const url = `${this.baseUrl}/repos/${repoName}`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getRepository',
      },
    })
  }

  getRepositories = async () => {
    const url = `${this.baseUrl}/repos`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getRepositories',
      },
    })
  }

  createRepository = async (body) => {
    const url = `${this.baseUrl}/repos`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createRepository',
      },
    })
  }

  updateRepositoryCredentials = async (body) => {
    const url = `${this.baseUrl}/repos`
    return this.client.basicPatch({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateRepositoryCredentials',
      },
    })
  }

  deleteRepository = async (repoName) => {
    const url = `${this.baseUrl}/repos`
    const data = { name: repoName }
    return this.client.basicDelete({
      url,
      data,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteRepository',
      },
    })
  }

  updateRepositories = async (body) => {
    const url = `${this.baseUrl}/sync-repos`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateAllRepositories',
      },
    })
  }

  addRepoToCluster = async (repoName, clusterId) => {
    const url = `${this.baseUrl}/repos/${repoName}/cluster/${clusterId}`
    return this.client.basicPost({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addRepoToCluster',
      },
    })
  }

  addRepoToClusters = async (repoName, body) => {
    const url = `${this.baseUrl}/repos/${repoName}/clusters`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addRepoToClusters',
      },
    })
  }

  deleteRepoFromClusters = async (repoName, body) => {
    const url = `${this.baseUrl}/repos/${repoName}/clusters`
    const data = body
    return this.client.basicDelete({
      url,
      data,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteRepoFromClusters',
      },
    })
  }

  deleteRepoFromCluster = async (repoName, clusterId) => {
    const url = `${this.baseUrl}/repos/${repoName}/cluster/${clusterId}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteRepoFromCluster',
      },
    })
  }

  getRepositoriesForCluster = async (clusterId) => {
    const url = `${this.baseUrl}/clusters/${clusterId}/repos`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getRepositoriesForCluster',
      },
    })
  }

  getCharts = async () => {
    const url = `${this.baseUrl}/charts`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getCharts',
      },
    })
  }

  getChartsForCluster = async (clusterId) => {
    const url = `${this.baseUrl}/clusters/${clusterId}/repos/charts`
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getChartsForCluster',
      },
    })
  }

  getChartInfo = async (repository, name, params) => {
    const url = createUrlWithQueryString(
      `${this.baseUrl}/charts/${repository}/${name}/info`,
      params,
    )
    return this.client.basicGet({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getChartInfo',
      },
    })
  }

  deployChart = async (clusterId, namespace, body) => {
    const url = `${this.baseUrl}/clusters/${clusterId}/namespaces/${namespace}/releases`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deployChart',
      },
    })
  }
}

export default Helm

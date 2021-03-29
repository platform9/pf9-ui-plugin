import ApiService from 'api-client/ApiService'
import { createUrlWithQueryString } from 'core/utils/routes'
import config from '../../config'
import {
  App,
  AppDetails,
  DeployedApp,
  DeployedAppDetails,
  RepositoriesForCluster,
  Repository,
} from './helm.model'

class Helm extends ApiService {
  public getClassName() {
    return 'helm'
  }

  protected async getEndpoint() {
    return Promise.resolve(config.apiHost)
  }

  get baseUrl(): string {
    return '/pf9helm'
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
    return this.client.basicGet<Repository[]>({
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

  addClusterToRepository = async (repoName, clusterId) => {
    const url = `${this.baseUrl}/repos/${repoName}/cluster/${clusterId}`
    return this.client.basicPost({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addClusterToRepository',
      },
    })
  }

  addClustersToRepository = async (repoName, body) => {
    const url = `${this.baseUrl}/repos/${repoName}/clusters`
    return this.client.basicPost({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addClustersToRepository',
      },
    })
  }

  deleteClustersFromRepository = async (repoName, body) => {
    const url = `${this.baseUrl}/repos/${repoName}/clusters`
    const data = body
    return this.client.basicDelete({
      url,
      data,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteClustersFromRepository',
      },
    })
  }

  deleteClusterFromRepository = async (repoName, clusterId) => {
    const url = `${this.baseUrl}/repos/${repoName}/cluster/${clusterId}`
    return this.client.basicDelete({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteClusterFromRepository',
      },
    })
  }

  getRepositoriesForCluster = async (clusterId) => {
    const url = `${this.baseUrl}/clusters/${clusterId}/repos`
    return this.client.basicGet<RepositoriesForCluster[]>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getRepositoriesForCluster',
      },
    })
  }

  getCharts = async () => {
    const url = `${this.baseUrl}/charts`
    return this.client.basicGet<App[]>({
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

  getChartInfo = async (repoName, name, params) => {
    const url = createUrlWithQueryString(`${this.baseUrl}/charts/${repoName}/${name}/info`, params)
    return this.client.basicGet<AppDetails>({
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

  getReleases = async (clusterId, namespace) => {
    const url = `${this.baseUrl}/clusters/${clusterId}/namespaces/${namespace}/releases`
    return this.client.basicGet<DeployedApp[]>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getReleases',
      },
    })
  }

  deleteRelease = async (clusterId, namespace, data) => {
    const url = `${this.baseUrl}/clusters/${clusterId}/namespaces/${namespace}/releases`
    return this.client.basicDelete({
      url,
      data,
      options: {
        clsName: this.getClassName(),
        mthdName: 'deleteRelease',
      },
    })
  }

  updateRelease = async (clusterId, namespace, body) => {
    const url = `${this.baseUrl}/clusters/${clusterId}/namespaces/${namespace}/releases`
    return this.client.basicPut({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateRelease',
      },
    })
  }

  getReleaseInfo = async (clusterId, namespace, releaseName) => {
    const url = `${this.baseUrl}/clusters/${clusterId}/namespaces/${namespace}/releases/${releaseName}`
    return this.client.basicGet<DeployedAppDetails>({
      url,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getReleaseInfo',
      },
    })
  }
}

export default Helm

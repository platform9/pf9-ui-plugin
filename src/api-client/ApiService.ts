import ApiClient from 'api-client/ApiClient'

abstract class ApiService {
  protected apiEndpoint: string = ''
  clsName = ''
  constructor(protected client: ApiClient) {
    // this.initialize()
  }

  async initialize() {
    const tmp = await this.endpoint()
    this.apiEndpoint = tmp
  }

  abstract endpoint(): Promise<string>
}

export default ApiService

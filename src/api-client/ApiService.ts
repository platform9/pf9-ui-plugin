import ApiClient from 'api-client/ApiClient'

abstract class ApiService {
  protected apiEndpoint: string
  constructor(protected client: ApiClient) {
    this.initialize()
  }

  async initialize() {
    this.apiEndpoint = await this.endpoint()
  }

  abstract endpoint(): Promise<string>
}

export default ApiService

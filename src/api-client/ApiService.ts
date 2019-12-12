import ApiClient from 'api-client/ApiClient'

abstract class ApiService {
  protected constructor (protected client: ApiClient) {
  }

  abstract endpoint(): string | Promise<string>
}

export default ApiService

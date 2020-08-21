import ApiClient from 'api-client/ApiClient'
import { clientActions } from 'core/client/clientReducers'
import store from 'src/app/store'

abstract class ApiService {
  protected apiEndpoint: string = ''
  clsName = ''
  constructor(protected client: ApiClient) {
    this.initialize()
  }

  async initialize() {
    const endpoint = await this.endpoint()
    store.dispatch(
      clientActions.updateClient({
        clientKey: this.clsName,
        value: endpoint,
      }),
    )
    this.apiEndpoint = endpoint
  }

  abstract endpoint(): Promise<string>
}

export default ApiService

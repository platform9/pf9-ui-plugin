import ApiClient from 'api-client/ApiClient'
import { clientActions } from 'core/client/clientReducers'
import store from 'app/store'

abstract class ApiService {
  protected apiEndpoint: string = ''
  private readonly clsName: string
  protected abstract getClassName(): string
  protected abstract getEndpoint(): Promise<string>

  constructor(protected client: ApiClient) {
    this.clsName = this.getClassName()
    this.initialize()
  }

  async initialize() {
    const endpoint = await this.getEndpoint()
    store.dispatch(
      clientActions.updateClient({
        clientKey: this.clsName,
        value: endpoint,
      }),
    )
    this.apiEndpoint = endpoint
  }
}

export default ApiService

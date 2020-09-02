import ApiClient from 'api-client/ApiClient'
import { clientActions } from 'core/client/clientReducers'
import store from 'app/store'

abstract class ApiService {
  protected apiEndpoint: string = ''
  private readonly clsName: string
  public abstract getClassName(): string
  protected abstract getEndpoint(): Promise<string>

  constructor(protected client: ApiClient) {
    this.clsName = this.getClassName()
  }

  async initialize() {
    // reset the endpoint
    this.apiEndpoint = ''

    this.apiEndpoint = await this.getEndpoint()

    // Make the endpoint available for the selectors
    store.dispatch(
      clientActions.setEndpoint({
        clientKey: this.clsName,
        value: this.apiEndpoint,
      }),
    )

    return this.apiEndpoint
  }

  async getApiEndpoint(): Promise<string> {
    if (this.apiEndpoint !== '') {
      // we already have the endpoint dont need to
      return Promise.resolve(this.apiEndpoint)
    }
    return this.initialize()
  }
}

export default ApiService

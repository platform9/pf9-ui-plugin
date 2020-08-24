import ApiClient from 'api-client/ApiClient'
import { clientActions } from 'core/client/clientReducers'
import store from 'app/store'

abstract class ApiService {
  protected apiEndpoint: string = ''
  private readonly clsName: string
  public abstract getClassName(): string
  protected abstract getEndpoint(): Promise<string>
  private endpointPromise: Promise<string>

  constructor(protected client: ApiClient) {
    this.clsName = this.getClassName()
    this.initialize()
  }

  async initialize() {
    // reset the endpoint
    this.apiEndpoint = ''

    // cache the promise incase it is accessed before resolution
    this.endpointPromise = this.getEndpoint()

    this.apiEndpoint = await this.endpointPromise
    store.dispatch(
      clientActions.updateClient({
        clientKey: this.clsName,
        value: this.apiEndpoint,
      }),
    )
  }

  async getApiEndpoint(): Promise<string> {
    if (this.apiEndpoint !== '') {
      // we already have the endpoint dont need to
      return Promise.resolve(this.apiEndpoint)
    }
    return this.endpointPromise
  }
}

export default ApiService

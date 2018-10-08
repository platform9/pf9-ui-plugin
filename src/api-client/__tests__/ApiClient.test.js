import config from '../../../config'
import ApiClient from '../ApiClient'

const keystoneEndpoint = `${config.host}/keystone`
const makeClient = () => new ApiClient({ keystoneEndpoint })

describe('ApiClient', () => {
  it('create a client instance', () => {
    const client = new ApiClient({ keystoneEndpoint })
    expect(client).toBeDefined()
  })

  it('requires an endpoint to be set', () => {
    expect(() => { new ApiClient() }).toThrow()
    expect(() => { new ApiClient({ keystoneEndpoint }) }).not.toThrow()
  })

  it('includes the keystone API', () => {
    const client = makeClient()
    expect(client.keystone).toBeDefined()
  })

  it('supports serialization to maintain state', () => {
    const client = makeClient()
    const state = client.serialize()
    expect(state).toBeDefined()
    expect(state.keystoneEndpoint).toEqual(keystoneEndpoint)
  })

  it('supports hydration', () => {
    const client = makeClient()
    const state = client.serialize()
    const newClient = ApiClient.hydrate(state)
    const newState = newClient.serialize()
    expect(newState.keystoneEndpoint).toEqual(keystoneEndpoint)
  })
})

import config from '../../../config'
import OpenstackClient from '../OpenstackClient'

const keystoneEndpoint = `${config.host}/keystone`
const makeClient = () => new OpenstackClient({ keystoneEndpoint })

describe('OpenstackClient', () => {
  it('create a client instance', () => {
    const client = new OpenstackClient({ keystoneEndpoint })
    expect(client).toBeDefined()
  })

  it('requires an endpoint to be set', () => {
    expect(() => { new OpenstackClient() }).toThrow()
    expect(() => { new OpenstackClient({ keystoneEndpoint }) }).not.toThrow()
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
    const newClient = OpenstackClient.hydrate(state)
    const newState = newClient.serialize()
    expect(newState.keystoneEndpoint).toEqual(keystoneEndpoint)
  })
})

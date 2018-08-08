import {
  makeRegionedClient,
} from '../helpers'

describe('Murano', () => {
  let client

  beforeEach(async () => {
    client = await makeRegionedClient()
  })

  it('list applications', async () => {
    const applications = await client.murano.getApplications()
    expect(applications).toBeDefined()
  })

  it('TEST for CRUD functions', async () => {
    // TODO: handle multipart/formdata test
  })
})

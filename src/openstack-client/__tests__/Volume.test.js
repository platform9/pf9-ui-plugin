import {
  makeRegionedClient
} from '../helpers'

describe('Volumes', () => {
  it('list volumes', async () => {
    const client = await makeRegionedClient()
    const volumes = await client.volume.getVolumes()
    console.log(volumes)
    expect(volumes).toBeDefined()
  })
})

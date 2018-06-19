import {
  makeRegionedClient
} from '../helpers'

describe('Volumes', () => {
  it('list volumes', async () => {
    const client = await makeRegionedClient()
    const volumes = await client.volume.getVolumes()
    expect(volumes).toBeDefined()
  })

  it('create and delete a volume placeholder', async () => {
    const client = await makeRegionedClient()
    const volume = await client.volume.createVolume({
      name: 'FeelFreeToDelete',
      size: 2,
      metadata: {}
    })
    expect(volume).toBeDefined()
  })
})

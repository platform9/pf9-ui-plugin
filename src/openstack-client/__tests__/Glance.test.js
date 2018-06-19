import {
  makeRegionedClient,
} from '../helpers'

describe('Glance', () => {
  it('list images', async () => {
    const client = await makeRegionedClient()
    const images = await client.glance.getImages()
    expect(images).toBeDefined()
  })

  it('create and delete an image placeholder', async () => {
    const client = await makeRegionedClient()
    const image = await client.glance.createImage({
      container_format: 'bare',
      disk_format: 'raw',
      name: 'Ubuntu',
    })
    expect(image.id).toBeDefined()

    const images = await client.glance.getImages()
    expect(images.find(x => x.id === image.id)).toBeDefined()

    await client.glance.deleteImage(image.id)

    const images2 = await client.glance.getImages()
    expect(images2.find(x => x.id === image.id)).not.toBeDefined()
  })

  it('get image schema', async () => {
    const client = await makeRegionedClient()
    const schema = await client.glance.getImageSchema()
    const properties = schema.items.properties
    expect(properties).toBeDefined()
  })

  it('excluded image fields', async () => {
    const client = await makeRegionedClient()
    expect(client.glance.excludedImageFields).toBeDefined()
    expect(client.glance.excludedImageFields.length).toBeGreaterThan(0)
  })
})

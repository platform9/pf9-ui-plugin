import Image from '../Image'

describe('Image', () => {
  beforeEach(() => {
    Image.clearCollection()
  })

  describe('constructor', () => {
    it('creates an image', () => {
      const image = new Image({ name: 'Test-Image', pf9_description: 'Base CentOS Image Version 5', status: 'OK', owner: 'Development Team Tenant', visibility: 'private', protected: false, disk_format: 'qcow2', virtual_size: 40, size: 15 })
      expect(image).toBeDefined()
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of image', () => {
      const image = new Image({ name: 'Test-Image', pf9_description: 'Base CentOS Image Version 5', status: 'OK', owner: 'Development Team Tenant', visibility: 'private', protected: false, disk_format: 'qcow2', virtual_size: 40, size: 15 })
      expect(image.asJson()).toMatchObject({ name: 'Test-Image', pf9_description: 'Base CentOS Image Version 5', status: 'OK', owner: 'Development Team Tenant', visibility: 'private', protected: false, disk_format: 'qcow2', virtual_size: 40, size: 15 })
    })
  })
})

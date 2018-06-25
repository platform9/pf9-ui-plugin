import GlanceImage from '../GlanceImage'

describe('Glance Image', () => {
  beforeEach(() => {
    GlanceImage.clearCollection()
  })

  describe('constructor', () => {
    it('creates a glance image', () => {
      const glanceImage = new GlanceImage({ name: 'Test-Image', description: 'Base CentOS Image Version 5', status: 'OK', owner: 'Development Team Tenant', visibility: 'private', protected: false, disk_format: 'qcow2', virtual_size: 40, size: 15 })
      expect(glanceImage).toBeDefined()
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of glance image', () => {
      const glanceImage = new GlanceImage({ name: 'Test-Image', description: 'Base CentOS Image Version 5', status: 'OK', owner: 'Development Team Tenant', visibility: 'private', protected: false, disk_format: 'qcow2', virtual_size: 40, size: 15 })
      expect(glanceImage.asJson()).toMatchObject({ name: 'Test-Image', description: 'Base CentOS Image Version 5', status: 'OK', owner: 'Development Team Tenant', visibility: 'private', protected: false, disk_format: 'qcow2', virtual_size: 40, size: 15 })
    })
  })
})

import Volume from '../Volume'

describe('Volume', () => {
  beforeEach(() => {
    Volume.clearCollection()
  })

  describe('constructor', () => {
    it('creates a volume', () => {
      const volume = new Volume({ name: 'TestVolume', description: 'Lalala', type: 'SOF', metadata: 'ad', size: 15, sizeUnit: 'GB', bootable: false, status: 'available', tenantId: 'a', tenant: 'DEV1', source: 'Image', host: '', instance: 'It1', instanceId: '', device: 'Nothing', attachedMode: 'rw', readonly: false })
      expect(volume).toBeDefined()
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of the Volume', () => {
      const volume = new Volume({ name: 'TestVolume', description: 'Lalala', type: 'SOF', metadata: 'ad', size: 15, sizeUnit: 'GB', bootable: false, status: 'available', tenantId: 'a', tenant: 'DEV1', source: 'Image', host: '', instance: 'It1', instanceId: '', device: 'Nothing', attachedMode: 'rw', readonly: false })
      expect(volume.asJson()).toMatchObject({ name: 'TestVolume', description: 'Lalala', type: 'SOF', metadata: 'ad', size: 15, sizeUnit: 'GB', bootable: false, status: 'available', tenantId: 'a', tenant: 'DEV1', source: 'Image', host: '', instance: 'It1', instanceId: '', device: 'Nothing', attachedMode: 'rw', readonly: false })
    })
  })
})

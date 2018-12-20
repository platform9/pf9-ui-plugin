import Service from '../Service'

let context

describe('Service', () => {
  beforeEach(() => {
    context = {services: []}
  })

  describe('Basic functionality', () => {
    it('creates a Service', () => {
      const service = Service.create({ data: { metadata: { name: 'fakeService' } }, context, config: { namespace: 'default' } })
      expect(service).toBeDefined()
      expect(context.services.length).toBe(1)
      expect(service).toMatchObject({ metadata: { name: 'fakeService', namespace: 'default' } })
    })
  })
})

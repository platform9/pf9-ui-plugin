import Pod from '../Pod'

let context

describe('Pod', () => {
  beforeEach(() => {
    context = {pods: []}
  })

  describe('Basic functionality', () => {
    it('creates a Pod', () => {
      const pod = Pod.create({ data: { metadata: { name: 'fakePod' } }, context, config: { namespace: 'default' } })
      expect(pod).toBeDefined()
      expect(context.pods.length).toBe(1)
      expect(pod).toMatchObject({ metadata: { name: 'fakePod', namespace: 'default' } })
    })
  })
})

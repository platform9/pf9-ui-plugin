import Deployment from '../Deployment'

let context

describe('Deployment', () => {
  beforeEach(() => {
    context = { deployments: [], pods: [] }
  })

  describe('Basic functionality', () => {
    it('creates a Deployment with Pods', () => {
      const deployment = Deployment.create({ data: { metadata: { name: 'fakeDeployment' }, spec: { replicas: 2 } }, context, config: { namespace: 'default' } })
      expect(deployment).toBeDefined()
      expect(context.deployments.length).toBe(1)
      expect(deployment).toMatchObject({ metadata: { name: 'fakeDeployment', namespace: 'default' } })
      expect(context.pods.length).toBe(2)
      for (const pod of context.pods) {
        expect(pod).toMatchObject({ metadata: { ownerReferences: [{ name: 'fakeDeployment', uid: deployment.metadata.uid }] } })
      }
    })
  })
})

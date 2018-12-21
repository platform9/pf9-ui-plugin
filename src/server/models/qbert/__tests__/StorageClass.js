import StorageClass from '../StorageClass'

let context

describe('Storage Class', () => {
  beforeEach(() => {
    context = {storageClasses: []}
  })

  describe('Basic functionality', () => {
    it('creates a Storage Class', () => {
      const storageClass = StorageClass.create({ data: { metadata: { name: 'fakeStorageClass' } }, context })
      expect(storageClass).toBeDefined()
      expect(context.storageClasses.length).toBe(1)
      expect(storageClass).toMatchObject({ metadata: { name: 'fakeStorageClass' } })
    })
  })
})

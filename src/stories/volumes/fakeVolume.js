import faker from 'faker'

const fakeVolume = () => ({
  id: faker.random.uuid(),
  name: faker.random.word(),
  description: faker.random.words(),
  type: faker.random.arrayElement(['sfvol', 'testtype', 'vol-type', '']),
  metadata: [],
  size: faker.random.number(),
  sizeUnit: faker.random.arrayElement(['GB', 'TB']),
  bootable: faker.random.boolean().toString(),
  status: faker.random.arrayElement(['in use', 'available']),
  tenantId: faker.random.uuid(),
  tenant: faker.random.word(),
  source: faker.random.locale(),
  host: 'cartman.platform9.sys',
  instance: faker.random.word(),
  instanceId: faker.random.uuid(),
  device: faker.system.mimeType(),
  created: faker.date.past().toString(),
  attachedMode: faker.random.arrayElement(['rw', '']),
  readonly: faker.random.boolean().toString()
})

export default fakeVolume

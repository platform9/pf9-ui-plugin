import faker from 'faker'

const fakeService = () => {
  const interfaces = ['admin', 'internal', 'public']

  const endpoints = interfaces.map((iface) => {
    return {
      id: faker.random.uuid(),
      interface: iface,
      region: faker.random.word(),
      region_id: faker.random.word(),
      url: faker.internet.url()
    }
  })

  return {
    id: faker.random.uuid(),
    name: faker.random.word(),
    type: faker.random.number(),
    endpoints
  }
}

export default fakeService

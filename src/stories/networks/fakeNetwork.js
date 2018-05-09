import faker from 'faker'

const fakeNetwork = () => ({
  id: faker.random.uuid(),
  name: faker.random.word(),
})

export default fakeNetwork

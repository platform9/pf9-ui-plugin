import faker from 'faker'

const fakeRouter = () => ({
  id: faker.random.uuid(),
  name: faker.random.word(),
  status: faker.random.word(),
  tenant_id: faker.random.uuid(),
  admin_state_up: faker.random.boolean()
})

export default fakeRouter

import faker from 'faker'

const fakeNavbarItem = () => ({
  name: faker.random.word(),
  link: {
    path: faker.internet.url()
  },
})

export default fakeNavbarItem

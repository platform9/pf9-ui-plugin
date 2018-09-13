import faker from 'faker'

const fakeHost = () => ({
  host_ip: faker.internet.ip(),
  hypervisor_hostname: faker.random.word(),
  status: faker.random.word()
})

export default fakeHost

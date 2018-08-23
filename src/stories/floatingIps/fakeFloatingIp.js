import faker from 'faker'

const fakeFloatingIp = () => ({
  floating_ip_address: faker.internet.ip(),
  fixed_ip_address: faker.internet.ip(),
})

export default fakeFloatingIp

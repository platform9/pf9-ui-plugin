import faker from 'faker'

const fakeSshKey = () => {
  let sshKey = {
    name: faker.random.word(),
    fingerprint: faker.random.word(),
    public_key: faker.random.word()
  }
  sshKey.id = sshKey.name
  return sshKey
}

export default fakeSshKey

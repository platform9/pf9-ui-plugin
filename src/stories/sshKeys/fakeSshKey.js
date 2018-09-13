import faker from 'faker'

const fakeSshKey = () => {
  let sshKey = {
    keypair: {
      name: faker.random.word(),
      fingerprint: faker.random.word(),
      public_key: faker.random.word()
    }
  }
  sshKey.keypair.id = sshKey.keypair.name
  return sshKey
}

export default fakeSshKey

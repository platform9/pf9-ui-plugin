import SshKey from '../SshKey'

describe('SshKey', () => {
  beforeEach(() => {
    SshKey.clearCollection()
  })

  describe('constructor', () => {
    it('creates an ssh key', () => {
      const sshKey = new SshKey({ name: 'TestKey' })
      expect(sshKey).toBeDefined()
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of the key', () => {
      const sshKey = new SshKey({ name: 'TestKey', public_key: 'qwertyuiop' })
      expect(sshKey.asJson()).toMatchObject({ keypair: { name: 'TestKey', fingerprint: '', public_key: 'qwertyuiop' } })
    })
  })
})

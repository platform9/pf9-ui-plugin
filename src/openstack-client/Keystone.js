import axios from 'axios'

const constructPasswordMethod = (username, password) => ({
  user: {
    name: username,
    domain: { id: 'default' },
    password
  }
})

class Keystone {
  constructor (client) {
    this.client = client
  }

  get endpoint () {
    return this.client.options.keystoneEndpoint
  }

  async authenticate (username, password) {
    const body = {
      auth: {
        identity: {
          methods: ['password'],
          password: {
            ...constructPasswordMethod(username, password)
          }
        }
      }
    }

    try {
      const response = await axios.post(`${this.endpoint}/v3/auth/tokens?nocatalog`, body)
      const token = response.data.token.id
      this.client.unscopedToken = token
      return token
    } catch (err) {
      // authentication failed
      return null
    }
  }
}

export default Keystone

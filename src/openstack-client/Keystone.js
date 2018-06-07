import axios from 'axios'

const authConstructors = {
  password: (username, password) => ({
    user: {
      name: username,
      domain: { id: 'default' },
      password
    }
  }),

  token: token => ({ id: token })
}

const constructAuthBody = (method, ...args) => {
  const body = {
    auth: {
      identity: {
        methods: [method],
        [method]: authConstructors[method](...args)
      },
    }
  }

  return body
}

class Keystone {
  constructor (client) {
    this.client = client
  }

  get endpoint () { return this.client.options.keystoneEndpoint }
  get v3 () { return `${this.endpoint}/v3` }

  get regionsUrl () { return `${this.v3}/regions` }
  get projectsUrl () { return `${this.v3}/auth/projects` }
  get tokensUrl () { return `${this.v3}/auth/tokens?nocatalog` }

  async getProjects () {
    const response = await axios.get(this.projectsUrl, this.client.getAuthHeaders(false))
    return response.data.projects
  }

  async changeProjectScope (projectId) {
    const body = constructAuthBody('token', this.client.unscopedToken)
    body.auth.scope = { project: { id: projectId } }
    try {
      const response = await axios.post(this.tokensUrl, body)
      const scopedToken = response.data.token.id
      this.client.scopedToken = scopedToken
      return scopedToken
    } catch (err) {
      // authentication failed
      return null
    }
  }

  async authenticate (username, password) {
    const body = constructAuthBody('password', username, password)

    try {
      const response = await axios.post(this.tokensUrl, body)
      const unscopedToken = response.data.token.id
      this.client.unscopedToken = unscopedToken
      return unscopedToken
    } catch (err) {
      // authentication failed
      return null
    }
  }

  async getRegions () {
  }
}

export default Keystone

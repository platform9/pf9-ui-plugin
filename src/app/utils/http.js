require('isomorphic-fetch')

const registry = require('./registry')

const urlWithHost = url => {
  const host = registry.getItem('apiHost') || ''
  return `${host}${url}`
}

const authTokenHeader = () => ({ 'X-Auth-Token': registry.getInstance().token })
const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
})

const http = {
  bare: {},

  json: {
    post (url, body, additionalHeaders = {}) {
      const params = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          ...jsonHeaders(),
          ...additionalHeaders,
        }
      }
      return fetch(urlWithHost(url), params)
    }
  },

  authenticated: {
    openstack: {
      get (url) {
        const params = {
          method: 'GET',
          headers: {
            ...authTokenHeader()
          }
        }
        return fetch(urlWithHost(url), params).then(x => x.json())
      },

      post (url, body) {
        const params = {
          method: 'POST',
          headers: {
            ...authTokenHeader(),
            ...jsonHeaders(),
          },
          body: JSON.stringify(body),
        }
        return fetch(urlWithHost(url), params).then(x => x.json())
      },

      delete (url) {
        const params = {
          method: 'DELETE',
          headers: {
            ...authTokenHeader(),
          },
        }
        return fetch(urlWithHost(url), params)
      }
    }
  }
}

export default http

import http from '../http'
import * as registry from '../registry'

const originalFetch = global.fetch

describe('http', () => {
  beforeEach(() => {
    global.fetch = require('jest-fetch-mock')
  })

  describe('json', () => {
    describe('post', () => {
      it('should use JSON in the request', async () => {
        const mockedFetch = jest.fn()
        global.fetch = mockedFetch
        const body = { foo: 'bar' }
        await http.json.post('http://somewhere.com', body)
        const expectedBody = {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
        expect(mockedFetch).toHaveBeenCalledWith('http://somewhere.com', expectedBody)
      })

      it('should parse JSON in the response', async () => {
        fetch.mockResponseOnce(JSON.stringify({ foo: 'bar' }))
        const response = await http.json.post('http://somewhere.com', { foo: 'ignore-me' })
        expect(response).toBeDefined()
        const json = await response.json()
        expect(json).toEqual({ foo: 'bar' })
      })
    })
  })

  describe('authenticated', () => {
    describe('get', () => {
      it('should have the x-auth-token set in the request header', async () => {
        const mockedFetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve(null) })
        global.fetch = mockedFetch
        registry.setItem('token', 'secretToken')
        await http.authenticated.openstack.get('http://somewhere.com')
        const expectedBody = {
          method: 'GET',
          headers: {
            'X-Auth-Token': 'secretToken'
          }
        }
        expect(mockedFetch).toHaveBeenCalledWith('http://somewhere.com', expectedBody)
      })
    })

    describe('post', () => {
      it('should use JSON in the request', async () => {
        const body = { foo: 'bar' }
        const mockedFetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve(body) })
        global.fetch = mockedFetch
        await http.authenticated.openstack.post('http://somewhere.com', body)
        const expectedResponse = {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': 'secretToken',
          }
        }
        expect(mockedFetch).toHaveBeenCalledWith('http://somewhere.com', expectedResponse)
      })

      it('should return the JSON body directly', async () => {
        fetch.mockResponseOnce(JSON.stringify({ foo: 'bar' }))
        const response = await http.authenticated.openstack.post('http://somewhere.com', { foo: 'ignore-me' })
        expect(response).toEqual({ foo: 'bar' })
      })
    })
  })

  afterAll(() => {
    global.fetch = originalFetch
  })
})

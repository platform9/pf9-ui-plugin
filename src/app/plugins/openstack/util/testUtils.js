import { identity } from '../../../core/fp'

export function mockResponse (params = {}) {
  const { headers = {}, ...rest } = params
  const headersObj = { get: key => headers[key] }
  const json = () => Promise.resolve(rest)
  return Promise.resolve({
    json,
    headers: headersObj,
  })
}

export const jestMockResponse = (params) => jest.fn(() => mockResponse(params))

export const lastCall = fn => fn.mock.calls[fn.mock.calls.length - 1]

export const mockDispatch = jest.fn(identity)

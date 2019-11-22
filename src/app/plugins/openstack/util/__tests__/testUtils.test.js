import { lastCall, mockResponse } from '../testUtils'

it('mockResponse', async () => {
  const response = await mockResponse({ foo: 'bar', headers: { headerKey: 'headerValue' } })
  expect(await response.json()).toEqual({ foo: 'bar' })
  expect(await response.headers.get('headerKey')).toEqual('headerValue')
})

it('lastResponse', () => {
  const fn = { mock: { calls: [5, 4, 2, 7] } }
  expect(lastCall(fn)).toEqual(7)
})

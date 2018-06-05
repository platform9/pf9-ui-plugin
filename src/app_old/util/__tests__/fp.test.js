import {
  identity,
  pluck,
  pluckAsync,
} from '../fp'

describe('fp', () => {
  it('identity', () => {
    expect(identity(123)).toEqual(123)
  })

  it('pluck', () => {
    const obj = { foo: 'bar', another: 123 }
    const fn = pluck('foo')
    expect(fn(obj)).toEqual('bar')
  })

  it('pluckAsync', async () => {
    const promise = Promise.resolve({ foo: 'value' })
    const value = await pluckAsync('foo')(promise)
    expect(value).toEqual('value')
  })
})

import {
  compose,
  filterFields,
  identity,
  mergeKey,
  pick,
  pickMultiple,
  pipe,
  pluck,
  pluckAsync,
} from '../fp'

describe('functional programming utils', () => {
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

  it('compose', () => {
    const sq = x => x * x
    const half = x => x / 2
    const value = compose(half, sq)(4)
    expect(value).toEqual(8)
  })

  it('pipe', () => {
    const sq = x => x * x
    const half = x => x / 2
    const value = pipe(sq, half)(4)
    expect(value).toEqual(8)
  })

  const srcObj = { a: 1, b: 2, c: 3 }
  const destObj = { foo: 'bar' }

  it('mergeKey', () => {
    const result = mergeKey(srcObj, destObj, 'a')
    expect(result).toEqual({ foo: 'bar', a: 1 })
    expect(destObj).toEqual({ foo: 'bar' })
  })

  it('pickMultiple', () => {
    const result = pickMultiple('a', 'b')(srcObj)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('pick', () => {
    expect(pick('b')(srcObj)).toEqual(2)
  })

  it('filterFields', () => {
    expect(filterFields('b', 'a')(srcObj)).toEqual({ c: 3 })
  })
})

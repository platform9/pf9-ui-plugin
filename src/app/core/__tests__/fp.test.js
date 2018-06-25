import {
  compose,
  pipe,
  pick,
  mergeKey,
  pickMultiple,
  filterFields,
} from '../fp'

describe('functional programming utils', () => {
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

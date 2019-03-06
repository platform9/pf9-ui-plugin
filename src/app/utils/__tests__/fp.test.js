import { T } from 'ramda'
import {
  compose,
  condLiteral,
  filterFields,
  identity,
  mergeKey,
  notEmpty,
  pick,
  pickMultiple,
  pipe,
  pipeWhenTruthy,
  projectAs,
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

  it('pipeWhenTruthy', () => {
    const first = () => 'first'
    const second = () => 'second'
    const third = () => null
    const fourth = () => 'fourth'

    expect(pipeWhenTruthy(first, second, third, fourth)('start')).toEqual(null)
    expect(pipeWhenTruthy(first, second)(true)).toEqual('second')
  })

  it('projectAs', () => {
    const values = [{ a: 123, b: 456 }, { c: 555 }]
    const mappings = { first: 'a', second: 'b', third: 'c' }
    const result = projectAs(mappings, values)
    expect(result[0]).toEqual({ first: 123, second: 456 })
    expect(result[1]).toEqual({ third: 555 })
  })

  it('condLiteral', () => {
    const arr = [1, 3, 5, 7, 14, 15]
    const divisibleBy = n1 => n2 => n2 % n1 === 0

    // without catch all
    const fn = condLiteral(
      [divisibleBy(3), 'three'],
      [divisibleBy(5), 'five'],
      [divisibleBy(7), 'seven'],
    )
    const result = arr.map(fn)
    expect(result).toEqual([undefined, 'three', 'five', 'seven', 'seven', 'three'])

    // with catch all
    const fn2 = condLiteral(
      [divisibleBy(3), 'three'],
      [divisibleBy(5), 'five'],
      [divisibleBy(7), 'seven'],
      [T, 'unknown']
    )
    const result2 = arr.map(fn2)
    expect(result2).toEqual(['unknown', 'three', 'five', 'seven', 'seven', 'three'])
  })

  it('notEmpty', () => {
    expect(notEmpty(null)).toEqual(false)
    expect(notEmpty(undefined)).toEqual(false)
    expect(notEmpty(0)).toEqual(false)
    expect(notEmpty(false)).toEqual(false)
    expect(notEmpty(123)).toEqual(false)
    expect(notEmpty(true)).toEqual(false)
    expect(notEmpty(() => {})).toEqual(false)
    expect(notEmpty([])).toEqual(false)
    expect(notEmpty('')).toEqual(false)

    expect(notEmpty('blah')).toEqual(true)
    expect(notEmpty([123])).toEqual(true)
    expect(notEmpty([null])).toEqual(true)
    expect(notEmpty([undefined])).toEqual(true)
  })
})

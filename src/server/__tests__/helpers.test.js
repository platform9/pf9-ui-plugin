import Tenant from '../models/openstack/Tenant'

import {
  ensureArray,
  findById,
  jsonOrNull,
  mapAsJson,
  pluck,
  whitelistKeys,
} from '../helpers'

describe('helpers', () => {
  describe('whitelistKeys', () => {
    it('whitelists the keys', () => {
      const obj = { foo: 'bar', abc: 123, doNotShowMe: 'should not be here' }
      const whitelistFn = whitelistKeys(['foo', 'abc'])
      const whitelisted = whitelistFn(obj)
      expect(whitelisted).toMatchObject({ foo: 'bar', abc: 123 })
      expect(Object.keys(whitelisted)).toEqual(['foo', 'abc'])
    })
  })

  describe('findById', () => {
    it('finds the object with the id in the array', () => {
      const arr = [ {id: 1, name: 'foo'}, {id: 2, name: 'bar'} ]
      expect(findById(arr)(1).name).toEqual('foo')
    })

    it('can retrieve the array from a getter function as well', () => {
      const arr = () => [ {id: 1, name: 'foo'}, {id: 2, name: 'bar'} ]
      expect(findById(arr)(2).name).toEqual('bar')
    })
  })

  describe('pluck', () => {
    it('get a value by its key', () => {
      const obj = { foo: 'bar', abc: 123 }
      expect(pluck('foo')(obj)).toEqual('bar')
    })
  })

  describe('mapAsJson', () => {
    it('converts an array of objects to their JSON form', () => {
      const arr = [
        new Tenant({ name: 'first' }),
        new Tenant({ name: 'second' }),
      ]
      const jsonOutput = mapAsJson(arr)
      expect(jsonOutput.length).toBe(2)
      expect(jsonOutput[0]).toMatchObject({ name: 'first' })
      expect(jsonOutput[1]).toMatchObject({ name: 'second' })
    })

    it('returns an empty array when it is not an array', () => {
      expect(mapAsJson('asdf')).toEqual([])
    })

    it('ensureArray', () => {
      expect(ensureArray([1, 2, 3])).toEqual([1, 2, 3])
      expect(ensureArray('asdf')).toEqual([])
      expect(ensureArray(null)).toEqual([])
      expect(ensureArray(undefined)).toEqual([])
    })
  })

  describe('jsonOrNull', () => {
    it('it converts missing objects to null instead of undefined', () => {
      const arr = [
        new Tenant({ name: 'foo' }),
        123,
        null,
        undefined,
        { name: 'foo' }, // plain objects should be null
        new Tenant({ name: 'bar' }),
      ]
      const results = arr.map(jsonOrNull)
      expect(results[0]).toMatchObject({ name: 'foo' })
      expect(results[5]).toMatchObject({ name: 'bar' })
      expect(results.slice(1, 5)).toEqual([null, null, null, null])
    })
  })
})

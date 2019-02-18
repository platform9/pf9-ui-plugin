import { curry, pathOr, remove } from 'ramda'
import moize from 'moize'

// functional programming helpers

export const pluck = key => obj => obj[key]
export const identity = x => x
export const isTruthy = x => !!x
export const exists = x => x !== undefined
export const propExists = curry((key, obj) => obj[key] !== undefined)

export const pluckAsync = key => promise => promise.then(obj => obj[key])

export const compose = (...fns) =>
  fns.reduce((f, g) => (...args) => f(g(...args)))
export const pipe = (...fns) => compose(...fns.reverse())
export const pick = key => obj => obj[key]

// Project the keys from the array of objects and rename them at the same time
// Ex:
// const values = [{ a: 123, b: 456 }, { c: 555 }]
// const mappings = { first: 'a', second: 'b', third: 'c' }
// projectAs(mappings, values) -> [{ first: 123, second: 456 }, { third: 555 }]
export const projectAs = curry((mappings, arr) => arr.map(obj => Object.keys(mappings).reduce(
  (accum, destKey) => {
    const srcKey = mappings[destKey]
    if (exists(obj[srcKey])) {
      accum[destKey] = obj[srcKey]
    }
    return accum
  },
  {}
)))

// Transparently inject side-effects in a functional composition "chain".
// Ex: const value = await somePromise.then(tap(x => console.log))
// Ex: compose(fn1, fn2, fn3, tap(log), fn4)(value)
export const tap = fn => arg => {
  fn(arg)
  return arg
}

export const mergeKey = (srcObj, destObj = {}, key) => {
  const clonedObj = { ...destObj }
  if (srcObj[key] !== undefined) {
    clonedObj[key] = srcObj[key]
  }
  return clonedObj
}

export const pickMultiple = (...keys) => obj =>
  keys.reduce((accum, key) => mergeKey(obj, accum, key), {})

export const filterFields = (...keys) => obj =>
  Object.keys(obj).reduce(
    (accum, key) => (keys.includes(key) ? accum : mergeKey(obj, accum, key)),
    {}
  )

// Lens-style setter useful for setState operations
// Allows for setting of values in a deeply nested object using cloning.
// We can extend with other functionality like arrays and using
// functions as selectors in the future if it looks like it will be useful.
export function setObjLens (obj, value, paths) {
  const [head, ...tail] = paths
  if (tail.length === 0) {
    return { ...obj, [head]: value }
  }
  return {
    ...obj,
    [head]: setObjLens(obj[head], value, tail),
  }
}

export const setStateLens = (value, paths) => state => {
  return setObjLens(state, value, paths)
}

export const range = (start, end) => {
  let arr = []
  for (let i = start; i <= end; i++) {
    arr.push(i)
  }
  return arr
}

// Returns a new array without the specified item
export const except = curry((item, arr) => {
  return remove(arr.indexOf(item), 1, arr)
})

// Converts from { foo: 'bar' } to [{ key: 'foo', value: 'bar' }]
export const objToKeyValueArr = (obj = {}) =>
  Object.entries(obj).map(([key, value]) => ({ key, value }))

// Converts from [{ key: 'foo', value: 'bar' }] to { foo: 'bar' }
export const keyValueArrToObj = (arr = []) =>
  arr.reduce((accum, { key, value }) => {
    accum[key] = value
    return accum
  }, {})

// Wait for each iteration to complete before continuing to the next (serial)
export const asyncMap = async (arr, callback) => {
  let newArr = []
  for (let i = 0; i < arr.length; i++) {
    newArr.push(await callback(arr[i], i, arr))
  }
  return newArr
}

export const asyncFlatMap = async (arr, callback) => {
  let newArr = []
  for (let i = 0; i < arr.length; i++) {
    // Array#flat is not widely supported so best to just implement ourselves.
    const values = await callback(arr[i], i, arr)
    if (values instanceof Array) {
      values.forEach(item => newArr.push(item))
    } else {
      newArr.push(values)
    }
  }
  return newArr
}

export const pathOrNull = pathStr => pathOr(null, pathStr.split('.'))

// I didn't see anything in Ramda that would allow me to create a "Maybe"
// composition so creating a simple version here.
// With long chains of functions it can get annoying to make sure each one
// contains a valid value before continuing.  This HOF performs a pipe but
// only when each function returns something truthy.
export const pipeWhenTruthy = (...fns) => arg => {
  if (!isTruthy(arg)) { return null }
  const [head, ...tail] = fns
  if (!head) { return arg }
  const result = head(arg)
  if (tail.length > 0) {
    if (!isTruthy(result)) { return null }
    return pipeWhenTruthy(...tail)(result)
  }
  return result
}

// Converts an array of items to a map/dictionary/assocArray form.
// Useful when an array needs to be indexed by a key from each of the itmes.
export const arrToObjByKey = curry((key, arr) =>
  arr.reduce(
    (accum, item) => {
      accum[item[key]] = item
      return accum
    },
    {}
  )
)

export const ensureArray = maybeArr =>
  (maybeArr && maybeArr instanceof Array) ? maybeArr : [maybeArr]

export const ensureFunction = moize(maybeFunc => (...args) => {
  if (typeof maybeFunc === 'function') {
    return maybeFunc(...args)
  }
  return maybeFunc
})

export const maybeFnOrNull = fn => value => value ? fn(value) : null

// Create a function that compares a value against multiple predicate functions,
// returning the first 'literal' from the matching predicate pair.
// If none match, then undefined is returned.
// (...[predicateFn, literal]) -> value -> literal
export const condLiteral = (...conds) => value => {
  for (let i=0; i<conds.length; i++) {
    const [pred, literal] = conds[i]
    if (pred(value)) { return literal }
  }
}

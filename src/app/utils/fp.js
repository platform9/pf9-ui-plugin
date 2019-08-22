import { T, cond, equals, always, adjust, update, findIndex, assocPath, curry, fromPairs, mapObjIndexed, pathOr, remove, flatten } from 'ramda'
import moize from 'moize'

// State hook initializers

export const emptyArr = Object.freeze([])
export const emptyObj = Object.freeze({})

// Functional programming helpers

export const pluck = key => obj => obj[key]
export const identity = x => x
export const isTruthy = x => !!x
export const exists = x => x !== undefined
export const propExists = curry((key, obj) => obj[key] !== undefined)
export const noop = () => {}

// Works for arrays and strings.  All other types return false.
export const notEmpty = arr => !!(arr && arr.length)

export const hasKeys = obj => {
  if (!(obj instanceof Object)) { return false }
  return Object.keys(obj).length > 0
}

export const pluckAsync = key => promise => promise.then(obj => obj[key])

export const pipeAsync = (...fns) =>
  async params => fns.reduce(async (prevResult, nextCb) => nextCb(prevResult), params)

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
  {},
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
    {},
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

export const asyncMap = async (arr, callback, parallel = true) => {
  if (parallel) {
    return Promise.all(arr.map((val, i) => callback(val, i, arr)))
  }
  let newArr = []
  for (let i = 0; i < arr.length; i++) {
    newArr.push(await callback(arr[i], i, arr))
  }
  return newArr
}

export const asyncFlatMap = async (arr, callback, parallel = true) => {
  if (parallel) {
    return flatten(await Promise.all(
      arr.map(async (val, i) => ensureArray(await callback(val, i, arr))),
    ))
  }
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

// Like Promise.all but for object properties instead of iterated values
// Example:
// asyncProps({
//   foo: getFoo(),
//   boo: getBoo(),
// }).then(results => {
//   console.log(results.foo, results.boo);
// });
export const asyncProps = async objPromises => {
  const promises = Object.values(mapObjIndexed(async (promise, key) => {
    return [key, await promise]
  }, objPromises))
  const results = await Promise.all(promises)

  return fromPairs(results)
}

export const pathOrNull = curry((pathStr, obj) => pathOr(null, pathStr.split('.'), obj))

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
    {},
  ),
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
  for (let i = 0; i < conds.length; i++) {
    const [pred, literal] = conds[i]
    if (pred(value)) { return literal }
  }
}

// Update an object in an array using a predicateFn and an updateFn.
//
// updateInArray :: (obj -> Boolean) -> (obj -> obj) -> arr -> arr
//
// Ex: updateInArray(
//   obj => obj.id === id,
//   obj => ({ ...obj, name: 'changed' }),
//   arr
// )
export const updateInArray = curry((predicateFn, updateFn, arr) =>
  arr.map(item => predicateFn(item) ? updateFn(item) : item)
)

// Like `updateInArray` but stops after finding the element to update
// Also like ramda `adjust` but using a predicateFn
export const adjustWith = curry((predicateFn, updateFn, arr) =>
  adjust(findIndex(predicateFn, arr), updateFn, arr)
)

// Like ramda `update` but using a predicateFn
export const updateWith = curry((predicateFn, newValue, arr) =>
  update(findIndex(predicateFn, arr), newValue, arr)
)

// Remove an item from an array using a predicateFn
export const removeWith = curry((predicateFn, arr) =>
  remove(findIndex(predicateFn, arr), 1, arr)
)

// applyJsonPatch :: oldObject -> patch -> newObject
export const applyJsonPatch = curry((patch, obj) => {
  const { op, path, value } = patch

  // assocPath requires array indexes to be integer not string
  const convertIntsToInts = n => !isNaN(n) ? parseInt(n, 10) : n

  const pathParts = path.split('/').slice(1).map(convertIntsToInts)
  if (op === 'replace') {
    return assocPath(pathParts, value, obj)
  }
})

/**
 * Returns a functional switch statement
 * @param {any} defaultValue Value to be returned in case no cases matches the key
 * @param {...array} case Conditions whose first item is the value to be tested against the key
 * @returns {function}
 *
 * @example
 *
 * const numbersSwitch = switchCase(
 *    "defaultValue",
 *    [1, "one"],
 *    [2, "two"]
 * )
 *
 * numbersSwitch(2) // "two"
 * numbersSwitch(5) // "defaultValue"
 */
export const switchCase = (defaultValue, ...cases) => key =>
  cond([
    ...cases.map(([caseCond, caseVal]) => [equals(caseCond), always(caseVal)]),
    [T, always(defaultValue)]
  ])(key)

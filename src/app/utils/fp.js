import {
  T, cond, equals, always, adjust, update, findIndex, assocPath, curry, pathOr, remove, values,
  groupBy, filter, either, isNil, isEmpty, path, sortBy, compose as rCompose, toLower, prop
} from 'ramda'
import moize from 'moize'

// State hook initializers

export const emptyArr = Object.freeze([])
export const emptyObj = Object.freeze({})

// Functional programming helpers

export const pluck = key => obj => obj[key]
export const isTruthy = x => !!x
export const exists = x => x !== undefined
export const noop = () => {}
export const isNilOrEmpty = either(isNil, isEmpty)

// Works for arrays and strings.  All other types return false.
export const notEmpty = arr => !!(arr && arr.length)

export const hasKeys = obj => {
  if (!(obj instanceof Object)) { return false }
  return Object.keys(obj).length > 0
}

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

export const pathStr = curry((str, obj) => path(str.split('.'), obj))
export const pathStrOr = curry((defaultValue, str, obj) => pathOr(defaultValue, str.split('.'), obj))
export const pathStrOrNull = curry((str, obj) => pathOr(null, str.split('.'), obj))

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
  arr.map(item => predicateFn(item) ? updateFn(item) : item),
)

// Like `updateInArray` but stops after finding the element to update
// Also like ramda `adjust` but using a predicateFn
export const adjustWith = curry((predicateFn, updateFn, arr) =>
  adjust(findIndex(predicateFn, arr), updateFn, arr)
)

// Like ramda `update` but using a predicateFn
export const updateWith = curry((predicateFn, newValue, arr) =>
  update(findIndex(predicateFn, arr), newValue, arr),
)

// Remove an item from an array using a predicateFn
export const removeWith = curry((predicateFn, arr) =>
  remove(findIndex(predicateFn, arr), 1, arr),
)

/**
 * Insert a set of items in an array updating those that match the predicateFn, and adding the ones who doesn't
 * @param {function} predicateFn Predicate used to know which values to compare when inserting the new items,
 * @param {array} newItems Items that will be added or used to update the target array
 * @param {array} targetArr Array that will receive the new items
 * @example
 * const targetArr = [{id: 1, val: "one"},{id: 2, val: "two"},{id: 3, val: "three"}]
 * const newItems = [{id: 2, val: "new two"}, {id: 4, val: "new four"}]
 * upsertAllBy(R.prop('id'), newItems, targetArr) -> [{id: 1, val: "one"},{id: 2, val: "new two"},{id: 3, val: "three"},{id: 4, val: "new four}]
 */
export const upsertAllBy = curry((predicateFn, newItems, targetArr) => {
  const groupedValues = values(groupBy(predicateFn, [...targetArr, ...newItems]))
  return groupedValues.map(
    ([oldVal, newVal]) => newVal
      ? { ...oldVal, ...newVal }
      : oldVal)
})

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

// Perform a filter on the provided array if the passed boolean is truthy
export const filterIf = curry(
  (cond, fn, items) => cond ? filter(fn, items) : items,
)

/**
 * Returns a functional switch statement
 * @param {*} defaultValue Value to be returned when no case matches the key
 * @param {...[*,*]} cases Case pairs of [condition, result] where "condition" will be tested against the provided value
 * @returns {function(*=): *}
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
export const switchCase = (defaultValue, ...cases) => input =>
  cond([
    ...cases.map(([caseCond, caseVal]) => [equals(caseCond), always(caseVal)]),
    [T, always(defaultValue)],
  ])(input)

/**
 * A functional switch case that accepts an object as an input of cases
 * A cleaner way (over switchCase) of dealing with sets of cases when the conditions are strings
 * @param {object} casesObj Object whose keys will be the conditions to test against the provided value
 * @param {*} [defaultValue] Value to be returned when no case matches the key
 * @returns {function(*=): *}
 *
 * @example
 *
 * const stringsSwitch = objSwitchCase({
 *   foo: "value foo",
 *   bar: "value bar"
 * }, "defaultValue")
 *
 * stringsSwitch("foo")  // "value foo"
 * stringsSwitch("test") // "defaultValue"
 */
export const objSwitchCase = (casesObj, defaultValue) => input =>
  casesObj.hasOwnProperty(input) ? casesObj[input] : defaultValue

export const sortByProperty = (list, attr) => {
  const sortByPropCaseInsensitive = sortBy(rCompose(toLower, prop(attr)))
  return sortByPropCaseInsensitive(list)
}

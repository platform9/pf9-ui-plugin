// functional programming helpers

export const pluck = key => obj => obj[key]
export const identity = x => x
export const isTruthy = x => !!x
export const exists = x => x !== undefined

export const pluckAsync = key => promise => promise.then(obj => obj[key])

export const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))
export const pipe = (...fns) => compose(...fns.reverse())
export const pick = key => obj => obj[key]

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
    (accum, key) => keys.includes(key) ? accum : mergeKey(obj, accum, key),
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
    ...obj, [head]: setObjLens(obj[head], value, tail)
  }
}

export const setStateLens = (value, paths) => state => {
  return setObjLens(state, value, paths)
}

export const range = (start, end) => {
  let arr = []
  for (let i=start; i<=end; i++) { arr.push(i) }
  return arr
}

// Converts from { foo: 'bar' } to [{ key: 'foo', value: 'bar' }]
export const objToKeyValueArr = (obj = {}) => Object.entries(obj).map(([key, value]) => ({ key, value }))

// Converts from [{ key: 'foo', value: 'bar' }] to { foo: 'bar' }
export const keyValueArrToObj = (arr = []) => arr.reduce(
  (accum, { key, value }) => {
    accum[key] = value
    return accum
  },
  {}
)

// Wait for each iteration to complete before continuing to the next (serial)
export const asyncForEach = async (arr, callback) => {
  for (let i=0; i<arr.length; i++) {
    await callback(arr[i], i, arr)
  }
}

import { curry, flatten, mapObjIndexed, fromPairs, head } from 'ramda'
import { ensureArray } from 'utils/fp'

export const pluckAsync = curry((key, promise) => promise.then(obj => obj[key]))

export const pipeAsync = (...fns) =>
  async params => fns.reduce(async (prevPromise, nextCb) =>
    nextCb(await prevPromise), params)

export const mapAsync = curry(async (callback, arr) => {
  return Promise.all(arr.map((val, i) => callback(val, i, arr)))
})

export const flatMapAsync = curry(async (callback, arr) => {
  return flatten(await Promise.all(
    arr.map(async (val, i) => ensureArray(await callback(val, i, arr))),
  ))
})

// Functional async try catch
export const tryCatchAsync = curry(async (tryer, catcher, input) => {
  try {
    return await tryer(input)
  } catch (e) {
    return catcher(e)
  }
})

/**
 * Like Promise.all but for object properties instead of iterated values

 * @param objPromises
 * @returns {Promise<any>}
 *
 * @example
 * propsAsync({
 *   foo: getFoo(),
 *   boo: getBoo(),
 * }).then(results => {
 *   console.log(results.foo, results.boo);
 * })
 */
export const propsAsync = async objPromises => {
  const promises = Object.values(
    mapObjIndexed(
      async (promise, key) => [key, await promise],
      objPromises,
    ))
  const results = await Promise.all(promises)

  return fromPairs(results)
}

/**
 * Like Promise.all but it won't reject if any (or all) of the promises are rejected
 * and it will always fullfill by returning an array with the successful results
 * An error handler function can be provided to deal with promise rejections individually
 * @param promises
 * @param [errorHandler] Function that can be used to handle the rejected promises
 * @returns {Promise<[*,...]>}
 */
export const someAsync = async (promises, errorHandler = err => console.warn(err)) => {
  const results = await Promise.all(promises.map(async promise => {
    try {
      return [await promise]
    } catch (err) {
      errorHandler(err)
      return null
    }
  }))
  // Just return the successful results
  return results.filter(Array.isArray).map(head)
}

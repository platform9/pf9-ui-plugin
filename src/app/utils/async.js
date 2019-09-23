import { curry, flatten, mapObjIndexed, fromPairs } from 'ramda'
import { ensureArray } from 'utils/fp'

export const pluckAsync = curry((key, promise) => promise.then(obj => obj[key]))

export const pipeAsync = (...fns) =>
  async params => fns.reduce(async (prevResult, nextCb) => nextCb(prevResult), params)

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

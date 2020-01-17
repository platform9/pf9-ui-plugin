export const notImplementedYet = (req, res) => res.status(500).send('Not implemented yet in simulator.')

// We need to allow 'arr' to be returned dynamically because the reference to 'arr' may change over time.
// We don't want the closure to hang on to a collection that has not been initialized or is no longer
// present.
// eslint-disable-next-line eqeqeq
export const findById = arr => id => (typeof arr === 'function' ? arr() : arr).find(x => x.id == id)

export const updateById = (arr) => {
  return (id, data) => {
    const _arr = typeof arr === 'function' ? arr() : arr
    const index = _arr.findIndex(x => x.id === id)
    _arr[index] = Object.assign(_arr[index], data)
    return _arr[index]
  }
}

export const pluck = key => obj => obj[key]

export const ensureArray = maybeArr => (maybeArr && maybeArr instanceof Array) ? maybeArr : []

export const mapAsJson = (arr, ...params) => ensureArray(arr).map(x => (x.asJson && x.asJson(...params)) || null)

export const jsonOrNull = obj => (obj && obj.asJson && obj.asJson()) || null

export const whitelistKeys = allowedKeys => obj => Object.keys(obj).reduce(
  (accum, key) => {
    if (allowedKeys.includes(key)) {
      accum[key] = obj[key]
    }
    return accum
  },
  {}
)

export const LOCAL_STORAGE_NAMESPACE = 'pf9'

export const getInstance = () => {
  if (global.localStorage === undefined) {
    return {}
  }
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_NAMESPACE) ||'{}')
}

export const getStorage = key => getInstance()[key]

export const setStorage = (key, value) => {
  const current = getInstance()
  current[key] = value
  localStorage.setItem(LOCAL_STORAGE_NAMESPACE, JSON.stringify(current))
}

export const clear = key => {
  const current = getInstance()
  delete current[key]
  localStorage.setItem(LOCAL_STORAGE_NAMESPACE, JSON.stringify(current))
}

export const clearAll = () => {
  localStorage.setItem(LOCAL_STORAGE_NAMESPACE, undefined)
}

// Used for storing global variables across the modules
let registry = {}

export const getInstance = () => registry

export const getItem = key => registry[key]

export const setItem = (key, value) => { registry[key] = value }

export const setupFromConfig = config => {
  registry.host = config.host
  registry.username = config.username
  registry.password = config.password
  registry.apiHost = config.apiHost
}

export const clearAll = () => {
  // We need to delete the keys not replace the object so the reference stays the same
  Object.keys(registry).forEach(key => {
    delete registry[key]
  })
}

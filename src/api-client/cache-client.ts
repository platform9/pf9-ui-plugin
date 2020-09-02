let cache: ApiCache = null

interface IWindow extends Window {
  cacheClient: ApiCache
}
declare var window: IWindow

export default class ApiCache {
  public cache = {}

  static get instance() {
    if (!cache) {
      cache = new ApiCache()
    }
    return cache
  }

  constructor() {
    window.cacheClient = this
  }

  public prettyPrint() {
    Object.entries(this.cache).forEach(([cls, cache]) => {
      console.log(`\n\n${cls}\n\n${JSON.stringify(cache)}`)
    })
  }

  public serialize() {
    return JSON.stringify(this.cache)
  }

  public cacheItem(cls, method, data) {
    this.cache = {
      ...this.cache,
      [cls]: {
        ...this.cache[cls],
        [method]: data,
      },
    }
  }
}

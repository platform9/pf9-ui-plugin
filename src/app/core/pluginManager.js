import { path } from 'ramda'
import { pathJoin } from 'utils/misc'

const defaultOptions = {
  showFooter: false,
  showNavMenu: true,
  showSidebar: false,
}

const pluginList = {}
const data = {}

const pluginManager = {
  clearAll (pluginId) {
    data[pluginId] = {
      components: [],
      routes: [],
      navItems: [],
      options: { ...defaultOptions },
    }
  },

  registerPlugin (pluginId, name, basePath) {
    pluginList[pluginId] = {
      name,
      basePath,
      registerComponent: (...args) => this.registerComponent(pluginId, ...args),
      registerRoutes: (...args) => this.registerRoutes(pluginId, ...args),
      registerNavItems: (...args) => this.registerNavItems(pluginId, ...args),
      getComponents: () => this.getComponents(pluginId),
      getRoutes: () => this.getRoutes(pluginId),
      getNavItems: () => this.getNavItems(pluginId),
      getOptions: () => this.getOptions(pluginId),
      getOption: (...args) => this.getOption(pluginId, ...args),
      setOption: (...args) => this.setOption(pluginId, ...args),
      getDefaultRoute: () => this.getDefaultRoute(pluginId),
      clearAll: (...args) => this.clearAll(pluginId, ...args),
    }
    data[pluginId] = {
      basePath,
      components: [],
      routes: [],
      navItems: [],
      options: { ...defaultOptions },
    }
    return pluginList[pluginId]
  },

  registerComponent (pluginId, component) {
    data[pluginId].components.push(component)
  },

  registerRoutes (pluginId, components=[]) {
    const prefixLink = link => ({
      ...link,
      path: pathJoin(data[pluginId].basePath, link.path)
    })

    components
      .map(c => ({ ...c, link: prefixLink(c.link) }))
      .forEach(component => data[pluginId].routes.push(component))
  },

  registerNavItems (pluginId, items=[]) {
    const prefixLink = link => ({
      ...link,
      path: pathJoin(data[pluginId].basePath, link.path)
    })

    items
      .map(x => ({ ...x, link: prefixLink(x.link) }))
      .forEach(item => {
        data[pluginId].navItems.push(item)
      })
  },

  getPlugins () {
    return pluginList
  },

  getPlugin (pluginId) {
    return pluginList[pluginId]
  },

  getComponents (pluginId) {
    return data[pluginId].components
  },

  getRoutes (pluginId) {
    return data[pluginId].routes
  },

  getNavItems (pluginId) {
    return data[pluginId].navItems
  },

  getOptions (pluginId) {
    return data[pluginId].options
  },

  getOption (pluginId, key) {
    return data[pluginId].options[key]
  },

  setOption (pluginId, key, value) {
    data[pluginId].options[key] = value
  },

  getDefaultRoute (pluginId) {
    return path(['link', 'path'],
      data[pluginId].routes.find(r => r.link && r.link.default))
  }
}

export default pluginManager

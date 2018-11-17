import { partial, path } from 'ramda'

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
    pluginList[pluginId] = Object.freeze({
      name,
      basePath,
      registerComponent: partial(this.registerComponent, [pluginId]),
      registerRoutes: partial(this.registerRoutes, [pluginId]),
      registerNavItems: partial(this.registerNavItems, [pluginId]),
      getComponents: partial(this.getComponents, [pluginId]),
      getRoutes: partial(this.getRoutes, [pluginId]),
      getNavItems: partial(this.getNavItems, [pluginId]),
      getOptions: partial(this.getOptions, [pluginId]),
      getOption: partial(this.getOption, [pluginId]),
      setOption: partial(this.setOption, [pluginId]),
      getDefaultRoute: partial(this.getDefaultRoute, [pluginId]),
    })
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
      path: `${data[pluginId].basePath}${link.path}`
    })

    components
      .map(c => ({ ...c, link: prefixLink(c.link) }))
      .forEach(component => data[pluginId].routes.push(component))
  },

  registerNavItems (pluginId, items=[]) {
    const prefixLink = link => ({
      ...link,
      path: `${data[pluginId].basePath}${link.path}`
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

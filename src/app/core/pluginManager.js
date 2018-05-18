const defaultOptions = {
  showFooter: false,
  showNavMenu: true,
  showSidebar: false,
}

let data = {
  components: [],
  pluginList: [],
  routes: [],
  navItems: [],
  schemas: [], // graphql schemas
  options: { ...defaultOptions },
}

const pluginManager = {
  clearAll () {
    data.components = []
    data.pluginList = []
    data.routes = []
    data.navItems = []
    data.options = { ...defaultOptions }
  },

  registerComponent (component) {
    data.components.push(component)
  },

  registerRoutes (prefix, components=[]) {
    const prefixLink = link => ({ ...link, path: `${prefix}${link.path}` })

    components
      .map(c => ({ ...c, link: prefixLink(c.link) }))
      .forEach(component => data.routes.push(component))
  },

  registerNavItems (prefix, items=[]) {
    const prefixLink = link => ({ ...link, path: `${prefix}${link.path}` })

    items
      .map(x => ({ ...x, link: prefixLink(x.link) }))
      .forEach(item => {
        data.navItems.push(item)
      })
  },

  registerSchema (schema) {
    data.schemas.push(schema)
  },

  getComponents () {
    return data.components
  },

  getRoutes () {
    return data.routes
  },

  getNavItems () {
    return data.navItems
  },

  getSchemas () {
    return data.schemas
  },

  getOptions () {
    return data.options
  },

  getOption (key) {
    return data.options[key]
  },

  setOption (key, value) {
    data.options[key] = value
  },

  getDefaultRoute () {
    return data.routes.find(r => r.link && r.link.default).link.path
  }
}

export default pluginManager

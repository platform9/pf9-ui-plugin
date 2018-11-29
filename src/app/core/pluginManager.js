import { path } from 'ramda'
import { pathJoin } from 'utils/misc'

const defaultOptions = {
  showFooter: false,
  showNavMenu: true,
  showSidebar: false,
}

const initData = () => ({
  components: [],
  routes: [],
  navItems: [],
  options: { ...defaultOptions },
})

const pluginList = {}

const parseNavItem = basePath => navItem => ({
  ...navItem,
  link: {
    ...navItem.link,
    path: pathJoin(basePath, navItem.link.path)
  },
  nestedLinks: navItem.nestedLinks
    ? navItem.nestedLinks.map(parseNavItem(basePath))
    : null
})

const pluginManager = {

  getPlugins () {
    return pluginList
  },

  getPlugin (pluginId) {
    return pluginList[pluginId]
  },

  registerPlugin: (pluginId, name, basePath) => {
    let data = initData()

    const prependBasePath = parseNavItem(basePath)

    pluginList[pluginId] = {
      name,

      basePath,

      clearAll: () => {
        data = initData()
      },

      registerComponent: (component) => {
        data.components.push(component)
      },

      registerRoutes: (components = []) => {
        data.routes = [
          ...data.routes,
          ...components.map(prependBasePath)
        ]
      },

      registerNavItems: (items = []) => {
        data.navItems = [
          ...data.navItems,
          ...items.map(prependBasePath)
        ]
      },

      getComponents: () => {
        return data.components
      },

      getRoutes: () => {
        return data.routes
      },

      getNavItems: () => {
        return data.navItems
      },

      getOptions: () => {
        return data.options
      },

      getOption: (key) => {
        return data.options[key]
      },

      setOption: (key, value) => {
        data.options[key] = value
      },

      getDefaultRoute: () => {
        return path(['link', 'path'],
          data.routes.find(r => r.link && r.link.default))
      }
    }

    return pluginList[pluginId]
  }
}

export default pluginManager

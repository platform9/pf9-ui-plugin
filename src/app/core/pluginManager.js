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

const pluginManager = {

  getPlugins () {
    return pluginList
  },

  getPlugin (pluginId) {
    return pluginList[pluginId]
  },

  registerPlugin: (pluginId, name, basePath) => {
    let data = initData()

    pluginList[pluginId] = {
      name,

      basePath,

      clearAll: () => {
        data = initData()
      },

      registerComponent: (component) => {
        data.components.push(component)
      },

      registerRoutes: (components=[]) => {
        const prefixLink = link => ({
          ...link,
          path: pathJoin(basePath, link.path)
        })

        components
          .map(c => ({ ...c, link: prefixLink(c.link) }))
          .forEach(component => data.routes.push(component))
      },

      registerNavItems: (items=[]) => {
        const prefixLink = link => ({
          ...link,
          path: pathJoin(basePath, link.path)
        })

        items
          .map(x => ({ ...x, link: prefixLink(x.link) }))
          .forEach(item => {
            data.navItems.push(item)
          })
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

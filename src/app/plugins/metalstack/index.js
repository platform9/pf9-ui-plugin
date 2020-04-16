import React from 'react'

import IronicSetupPage from 'openstack/components/ironicSetup/IronicSetupPage'

class MetalStack extends React.PureComponent {
  render() {
    return <h1>MetalStack Plugin</h1>
  }
}

MetalStack.__name__ = 'metalstack'

MetalStack.registerPlugin = (pluginManager) => {
  const plugin = pluginManager.registerPlugin('metalstack', 'MetalStack', '/ui/metalstack')

  plugin.registerRoutes([
    {
      name: 'IronicSetup',
      link: { path: '/setup', exact: true },
      component: IronicSetupPage,
    },
  ])

  const hostPrefix = 'https://ui-dev.platform9.horse' // set to another host during development
  const clarityBase = (path) => `${hostPrefix}/clarity/index.html#${path}`
  const clarityLink = (path) => ({ link: { path: clarityBase(path), external: true } })

  plugin.registerNavItems([
    {
      name: 'Dashboard',
      link: { path: '/setup' },
      icon: 'tachometer',
    },
    {
      name: 'Tenants',
      ...clarityLink('/infrastructure'),
      icon: 'building'
    },
    {
      name: 'Images',
      ...clarityLink('/images'),
      icon: 'file-code'
    },
    {
      name: 'Bare Metal Deploy',
      ...clarityLink('/instances'),
      icon: 'desktop',
    },
    {
      name: 'Networks',
      ...clarityLink('/networks'),
      icon: 'signal',
    },
    {
      name: 'Access & Security',
      ...clarityLink('/security'),
      icon: 'key',
    },
    {
      name: 'Flavors',
      ...clarityLink('/flavors'),
      icon: 'utensils',
    },
    {
      name: 'Tenants & Users',
      ...clarityLink('/users'),
      icon: 'user',
    },
    {
      name: 'Events & Alarms',
      ...clarityLink('/telemetry'),
      icon: 'bell',
    },
  ])
}

export default MetalStack

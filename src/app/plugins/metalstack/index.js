import React from 'react'

import IronicSetupPage from 'openstack/components/ironicSetup/IronicSetupPage'
import { clarityUrlRoot } from 'app/constants'

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
      link: { path: '/setup', exact: true, default: true },
      component: IronicSetupPage,
    },
  ])
  const hostPrefix = window.location.origin
  const clarityBase = (path) => `${hostPrefix}${clarityUrlRoot}${path}`
  const clarityLink = (path) => ({ link: { path: clarityBase(path), external: true } })

  plugin.registerNavItems([
    {
      name: 'Dashboard',
      link: { path: '/setup' },
      icon: 'tachometer',
    },
    {
      name: 'Bare Metal Setup',
      ...clarityLink('/infrastructure'),
      icon: 'building',
    },
    {
      name: 'Images',
      ...clarityLink('/images'),
      icon: 'file-code',
    },
    {
      name: 'Bare Metal Deployed',
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

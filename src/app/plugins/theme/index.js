import React from 'react'

import ConfigureThemePage from './components/ConfigureThemePage'

class Theme extends React.PureComponent {
  render () {
    return (
      <h1>Themes Plugin</h1>
    )
  }
}

Theme.__name__ = 'themes'

Theme.registerPlugin = pluginManager => {
  const plugin = pluginManager.registerPlugin(
    'themes', 'Themes', '/ui/themes'
  )

  plugin.registerRoutes(
    [
      {
        name: 'Configure Theme',
        link: { path: '/configure', exact: true, default: true },
        component: ConfigureThemePage
      },
    ]
  )

  // Hide the theme plugin from the sidenav until we have a way to
  // turn plugins on/off from a features.json.
  /*
  plugin.registerNavItems([
    {
      name: 'Configure Theme',
      link: { path: '/configure' },
      icon: 'palette',
    }
  ])
  */
}

export default Theme

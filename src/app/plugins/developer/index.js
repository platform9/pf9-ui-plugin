import React from 'react'

import DeveloperIndexPage from './components/DeveloperIndexPage'
import ContextViewer from './components/ContextViewer'

class Developer extends React.PureComponent {
  render () {
    return (
      <h1>Developer Plugin</h1>
    )
  }
}

Developer.__name__ = 'developer'

Developer.registerPlugin = pluginManager => {
  const plugin = pluginManager.registerPlugin('developer', 'Developer', '/ui/developer')

  plugin.registerRoutes(
    [
      {
        name: 'DeveloperHome',
        link: { path: '/', exact: true, default: false },
        component: DeveloperIndexPage
      },
      {
        name: 'ContextViewer',
        link: { path: '/context', exact: true },
        component: ContextViewer
      },
    ]
  )

  plugin.registerNavItems(
    [
      // Decided to embed these at the bottom of every page instead so don't
      // clutter the side navbar.
      /*
      { name: 'Developer Home', link: { path: '/' } },
      { name: 'Context Viewer', link: { path: '/context' } },
      */
    ]
  )
}

export default Developer

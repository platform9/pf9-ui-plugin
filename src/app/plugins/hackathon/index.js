import React from 'react'
import Demo from './components/Demo'
import FormBuilder from './components/formBuilder/FormBuilder'

import Hackathon10Home from './components/Hackathon10Home'
import NodeEditor from './components/NodeEditor'

class Hackathon extends React.Component {
  render () {
    return (
      <h1>Hackathon Plugin</h1>
    )
  }
}

Hackathon.__name__ = 'hackathon'

Hackathon.registerPlugin = pluginManager => {
  const plugin = pluginManager.registerPlugin(
    'hackathon', 'Hackathon', '/ui/hackathon'
  )

  plugin.registerRoutes(
    [
      {
        name: 'Home',
        link: { path: '/hackathon10', exact: true, default: true },
        component: Hackathon10Home
      },
      {
        name: 'NodeEditor',
        link: { path: '/nodeEditor', exact: true },
        component: NodeEditor,
      },
      {
        name: 'FormBuilder',
        link: { path: '/formBuilder', exact: true },
        component: FormBuilder,
      },
      {
        name: 'Demo',
        link: { path: '/demo', exact: true },
        component: Demo,
      },
    ]
  )

  plugin.registerNavItems(
    [
      { name: 'Home', link: { path: '/hackathon10' } },
      { name: 'Node Editor', link: { path: '/nodeEditor' } },
      { name: 'Form Builder', link: { path: '/formBuilder' } },
      { name: 'Demo', link: { path: '/demo' } },
    ]
  )
}

export default Hackathon

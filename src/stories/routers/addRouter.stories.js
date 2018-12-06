import React from 'react'
import { addStoriesFromModule, jsonDetailLogger } from '../helpers'

import { AddRouterForm } from 'openstack/components/routers/AddRouterPage'

const addStories = addStoriesFromModule(module)

addStories('Router Management/Adding a router', {
  'Add a router': () => (
    <AddRouterForm onSubmit={jsonDetailLogger('AddRouterForm#submit')} />
  )
})

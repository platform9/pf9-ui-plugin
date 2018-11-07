import React from 'react'
import { addStories, jsonDetailLogger } from '../helpers'

import { AddRouterForm } from 'openstack/components/routers/AddRouterPage'

addStories('Router Management/Adding a router', {
  'Add a router': () => (
    <AddRouterForm onSubmit={jsonDetailLogger('AddRouterForm#submit')} />
  ),
})

import React from 'react'
import { jsonDetailLogger, addStories } from '../helpers'

import { AddRouterForm } from 'openstack/components/routers/AddRouterPage'

addStories('Router Management/Adding a router', {
  'Add a router': () => (
    <AddRouterForm onSubmit={jsonDetailLogger('AddRouterForm#submit')} />
  )
})

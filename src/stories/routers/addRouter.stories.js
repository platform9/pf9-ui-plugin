import React from 'react'
import { jsonDetailLogger, addStories } from '../helpers'

import AddRouterForm from '../../app/plugins/openstack/components/routers/AddRouterForm'

addStories('Router Management/Adding a router', {
  'Add a router': () => (
    <AddRouterForm onSubmit={jsonDetailLogger('AddRouterForm#submit')} />
  )
})

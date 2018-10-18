import React from 'react'
import { jsonDetailLogger, addStories } from '../helpers'

import { AddFloatingIpForm } from 'openstack/components/floatingips/AddFloatingIpPage'

addStories('Floating IP Management/Adding a floating IP', {
  'Add a floating IP': () => (
    <AddFloatingIpForm onSubmit={jsonDetailLogger('AddFloatingIpForm#submit')} />
  )
})

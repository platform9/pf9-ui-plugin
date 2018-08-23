import React from 'react'
import { jsonDetailLogger, addStories } from '../helpers'

import AddFloatingIpForm from '../../app/plugins/openstack/components/floatingips/AddFloatingIpForm'

addStories('Floating IP Management/Adding a floating IP', {
  'Add a floating IP': () => (
    <AddFloatingIpForm onSubmit={jsonDetailLogger('AddFloatingIpForm#submit')} />
  )
})

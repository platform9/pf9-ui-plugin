import React from 'react'
import { addStoriesFromModule, jsonDetailLogger } from '../helpers'

import { AddFloatingIpForm } from 'openstack/components/floatingips/AddFloatingIpPage'

const addStories = addStoriesFromModule(module)

addStories('Floating IP Management/Adding a floating IP', {
  'Add a floating IP': () => (
    <AddFloatingIpForm onSubmit={jsonDetailLogger('AddFloatingIpForm#submit')} />
  )
})

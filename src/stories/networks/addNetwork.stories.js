import React from 'react'
import { addStoriesFromModule, jsonDetailLogger } from '../helpers'

import { AddNetworkForm } from 'openstack/components/networks/AddNetworkPage'

const addStories = addStoriesFromModule(module)

addStories('Network Management/Adding a network', {
  'Add a network': () => (
    <AddNetworkForm onSubmit={jsonDetailLogger('AddNetworkForm#submit')} />
  )
})

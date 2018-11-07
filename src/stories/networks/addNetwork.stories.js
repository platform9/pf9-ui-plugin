import React from 'react'
import { addStories, jsonDetailLogger } from '../helpers'

import { AddNetworkForm } from 'openstack/components/networks/AddNetworkPage'

addStories('Network Management/Adding a network', {
  'Add a network': () => (
    <AddNetworkForm onSubmit={jsonDetailLogger('AddNetworkForm#submit')} />
  ),
})

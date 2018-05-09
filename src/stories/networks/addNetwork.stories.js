import React from 'react'
import { jsonDetailLogger, addStories } from '../helpers'

import AddNetworkForm from '../../app/plugins/openstack/components/networks/AddNetworkForm'

addStories('Network Management/Adding a network', {
  'Add a network': () => (
    <AddNetworkForm onSubmit={jsonDetailLogger('AddNetworkForm#submit')} />
  )
})

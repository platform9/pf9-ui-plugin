import React from 'react'
import { addStories, jsonDetailLogger } from '../helpers'

import AddFlavorPage from 'openstack/components/flavors/AddFlavorPage'

addStories('Flavor Management/Adding a flavor', {
  'Add a flavor': () => (
    <AddFlavorPage onSubmit={jsonDetailLogger('AddFlavorForm#submit')} />
  )
})

import React from 'react'
import { jsonDetailLogger, addStories } from '../helpers'

import { AddFlavorForm } from 'openstack/components/flavors/AddFlavorPage'

addStories('Flavor Management/Adding a flavor', {
  'Add a flavor': () => (
    <AddFlavorForm onSubmit={jsonDetailLogger('AddFlavorForm#submit')} />
  )
})

import React from 'react'
import { addStoriesFromModule, jsonDetailLogger } from '../helpers'

import AddFlavorPage from 'openstack/components/flavors/AddFlavorPage'

const addStories = addStoriesFromModule(module)

addStories('Flavor Management/Adding a flavor', {
  'Add a flavor': () => (
    <AddFlavorPage onSubmit={jsonDetailLogger('AddFlavorForm#submit')} />
  )
})

import React from 'react'
import { addStoriesFromModule, jsonDetailLogger } from '../helpers'

import AddVolumeForm from 'openstack/components/volumes/AddVolumeForm'

const addStories = addStoriesFromModule(module)

addStories('Volume management/Adding a volume', {
  'Add a volume': () => (
    <AddVolumeForm onSubmit={jsonDetailLogger('AddVolumeForm#submit')} />
  )
})

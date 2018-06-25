import React from 'react'
import { jsonDetailLogger, addStories } from '../helpers'

import AddVolumeForm from 'openstack/components/volumes/AddVolumeForm'

addStories('Volume management/Adding a volume', {
  'Add a volume': () => (
    <AddVolumeForm onSubmit={jsonDetailLogger('AddVolumeForm#submit')} />
  )
})

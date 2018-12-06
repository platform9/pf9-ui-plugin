import React from 'react'
import { addStoriesFromModule, jsonDetailLogger } from '../helpers'

import AddSshKeyForm
  from '../../app/plugins/openstack/components/sshkeys/AddSshKeyForm'

const addStories = addStoriesFromModule(module)

addStories('SSH Key Management/Adding a key', {
  'Add a key': () => (
    <AddSshKeyForm onSubmit={jsonDetailLogger('AddSshKeyForm#submit')} />
  )
})

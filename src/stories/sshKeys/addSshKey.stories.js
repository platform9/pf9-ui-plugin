import React from 'react'
import { addStories, jsonDetailLogger } from '../helpers'

import AddSshKeyForm
  from '../../app/plugins/openstack/components/sshkeys/AddSshKeyForm'

addStories('SSH Key Management/Adding a key', {
  'Add a key': () => (
    <AddSshKeyForm onSubmit={jsonDetailLogger('AddSshKeyForm#submit')} />
  ),
})

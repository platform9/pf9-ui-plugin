import React from 'react'
import { jsonDetailLogger, addStories } from '../helpers'

import { AddForm as AddUserForm } from 'openstack/components/users/AddUserPage'

addStories('User management/Adding a user', {
  'Add a user': () => (
    <AddUserForm onSubmit={jsonDetailLogger('AddUserForm#submit')} />
  )
})

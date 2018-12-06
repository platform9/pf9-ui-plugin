import React from 'react'
import { addStoriesFromModule, jsonDetailLogger } from '../helpers'

import AddUserForm from 'openstack/components/users/AddUserPage'

const addStories = addStoriesFromModule(module)

addStories('User management/Adding a user', {
  'Add a user': () => (
    <AddUserForm onSubmit={jsonDetailLogger('AddUserForm#submit')} />
  ),
})

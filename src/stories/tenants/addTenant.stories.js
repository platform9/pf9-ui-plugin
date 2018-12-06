import React from 'react'
import { addStoriesFromModule, jsonDetailLogger } from '../helpers'

import { AddTenantForm } from 'openstack/components/tenants/AddTenantPage'

const addStories = addStoriesFromModule(module)

addStories('Tenants/Adding a tenant', {
  'Add a tenant': () => (
    <AddTenantForm onSubmit={jsonDetailLogger('AddTenantForm#submit')} />
  )
})

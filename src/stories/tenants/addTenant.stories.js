import React from 'react'
import { jsonDetailLogger, addStories } from '../helpers'

import { AddTenantForm } from 'openstack/components/tenants/AddTenantPage'

addStories('Tenants/Adding a tenant', {
  'Add a tenant': () => (
    <AddTenantForm onSubmit={jsonDetailLogger('AddTenantForm#submit')} />
  )
})

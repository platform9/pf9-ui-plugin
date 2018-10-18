import React from 'react'
import { linkTo } from '@storybook/addon-links'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { addStories, range } from '../helpers'
import fakeTenant from './fakeTenant'
import { TenantsList } from 'openstack/components/tenants/TenantsListPage'

const addAction = linkTo('Tenants/Adding a tenant', 'Add a tenant')
const deleteAction = action('Delete user')

const someTenants = range(3).map(fakeTenant)

addStories('Tenants/Listing tenants', {
  'With no tenants': () => (
    <TenantsList data={[]} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With some tenants': () => (
    <TenantsList data={someTenants} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With pagination': () => {
    const numTenants = number('numTenants', 7, { range: true, min: 0, max: 15, step: 1 })
    const tenants = range(numTenants).map(fakeTenant)
    return (
      <TenantsList data={tenants} onAdd={addAction} onDelete={deleteAction} />
    )
  },
})

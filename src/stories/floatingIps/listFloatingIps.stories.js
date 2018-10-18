import React from 'react'
import { linkTo } from '@storybook/addon-links'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { addStories, range } from '../helpers'
import fakeFloatingIp from './fakeFloatingIp'
import { FloatingIpsList } from 'openstack/components/floatingips/FloatingIpsListPage'

const addAction = linkTo('Floating IP Management/Adding a floating IP', 'Add a floating IP')
const someFloatingIps = range(3).map(fakeFloatingIp)
const deleteAction = action('Delete floating IP')

addStories('Floating IP Management/Listing floating IPs', {
  'With no floatingIps': () => (
    <FloatingIpsList data={[]} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With some floatingIps': () => (
    <FloatingIpsList data={someFloatingIps} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With pagination': () => {
    const numFloatingIps = number('numFloatingIps', 7, { range: true, min: 0, max: 15, step: 1 })
    const floatingIps = range(numFloatingIps).map(fakeFloatingIp)
    return (
      <FloatingIpsList data={floatingIps} onAdd={addAction} onDelete={deleteAction} />
    )
  },
})

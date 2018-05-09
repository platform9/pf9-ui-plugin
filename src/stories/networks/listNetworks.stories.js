import React from 'react'
import { linkTo } from '@storybook/addon-links'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { addStories, range } from '../helpers'
import fakeNetwork from './fakeNetwork'
import NetworksList from 'openstack/components/networks/NetworksList'

const addAction = linkTo('Network Management/Adding a network', 'Add a network')
const someNetworks = range(3).map(fakeNetwork)
const deleteAction = action('Delete network')

addStories('Network Management/Listing networks', {
  'With no networks': () => (
    <NetworksList networks={[]} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With some networks': () => (
    <NetworksList networks={someNetworks} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With pagination': () => {
    const numNetworks = number('numNetworks', 7, { range: true, min: 0, max: 15, step: 1 })
    const networks = range(numNetworks).map(fakeNetwork)
    return (
      <NetworksList networks={networks} onAdd={addAction} onDelete={deleteAction} />
    )
  },
})

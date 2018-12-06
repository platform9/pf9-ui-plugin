import React from 'react'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { addStoriesFromModule, range } from '../helpers'
import fakeHost from './fakeHost'
import HostsList from 'openstack/components/hosts/HostsList'

const addStories = addStoriesFromModule(module)
const addAction = () => {
  console.log('Todo')
}

const someHosts = range(3).map(fakeHost)
const deleteAction = action('Delete host')

addStories('Host Management/Listing hosts', {
  'With no hosts': () => (
    <HostsList hosts={[]} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With some hosts': () => (
    <HostsList hosts={someHosts} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With pagination': () => {
    const numHosts = number('numHosts', 7, { range: true, min: 0, max: 15, step: 1 })
    const hosts = range(numHosts).map(fakeHost)
    return (
      <HostsList hosts={hosts} onAdd={addAction} onDelete={deleteAction} />
    )
  },
})

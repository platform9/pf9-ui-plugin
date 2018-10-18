import React from 'react'
import { linkTo } from '@storybook/addon-links'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { addStories, range } from '../helpers'
import fakeSshKey from './fakeSshKey'
import { SshKeysList } from 'openstack/components/sshkeys/SshKeysListPage'

const addAction = linkTo('SSH Key Management/Adding a key', 'Add an SSH Key')
const someSshKeys = range(3).map(fakeSshKey)
const deleteAction = action('Delete SSH Key')

addStories('SSH Key Management/Listing keys', {
  'With no keys': () => (
    <SshKeysList data={[]} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With some keys': () => (
    <SshKeysList data={someSshKeys} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With pagination': () => {
    const numSshKeys = number('numSshKeys', 7, { range: true, min: 0, max: 15, step: 1 })
    const sshKeys = range(numSshKeys).map(fakeSshKey)
    return (
      <SshKeysList data={sshKeys} onAdd={addAction} onDelete={deleteAction} />
    )
  },
})

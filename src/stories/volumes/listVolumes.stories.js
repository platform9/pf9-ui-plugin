import React from 'react'
import { linkTo } from '@storybook/addon-links'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { addStories, range } from '../helpers'
import fakeVolume from './fakeVolume'
import VolumesList from 'openstack/components/volumes/VolumesList'

const addAction = linkTo('Volume management/Adding a volume', 'Add a volume')
const deleteAction = action('Delete volume')

const someVolumes = range(3).map(fakeVolume)

addStories('Volume management/Listing volumes', {
  'With no volumes': () => (
    <VolumesList volumes={[]} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With some volumes': () => (
    <VolumesList volumes={someVolumes} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With pagination': () => {
    const numVolumes = number('numVolumes', 7, { range: true, min: 0, max: 15, step: 1 })
    const volumes = range(numVolumes).map(fakeVolume)
    return (
      <VolumesList volumes={volumes} onAdd={addAction} onDelete={deleteAction} />
    )
  },
})

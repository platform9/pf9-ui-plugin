import React from 'react'
import { linkTo } from '@storybook/addon-links'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { addStoriesFromModule, range } from '../helpers'
import fakeVolume from './fakeVolume'
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera'
import { VolumesList } from 'openstack/components/volumes/VolumesListContainer'

const addStories = addStoriesFromModule(module)
const addAction = linkTo('Volume management/Adding a volume', 'Add a volume')
const deleteAction = action('Delete volume')

const someVolumes = range(3).map(fakeVolume)

const actions = {
  onAdd: addAction,
  onDelete: deleteAction,
  onEdit: action('Edit volume'),
}

addStories('Volume management/Listing volumes', {
  'With no volumes': () => (
    <VolumesList data={[]} {...actions} />
  ),

  'With some volumes': () => (
    <VolumesList data={someVolumes} {...actions} />
  ),

  'With pagination': () => {
    const numVolumes = number('numVolumes', 7, { range: true, min: 0, max: 15, step: 1 })
    const volumes = range(numVolumes).map(fakeVolume)
    return (
      <VolumesList data={volumes} {...actions} />
    )
  },

  'With snapshotting': () => {
    const handleSnapshot = action('Snapshot Volume')

    const rowActions = [
      { icon: <PhotoCameraIcon />, label: 'Snapshot', action: handleSnapshot }
    ]
    return (
      <VolumesList data={someVolumes} rowActions={rowActions} {...actions} />
    )
  }
})

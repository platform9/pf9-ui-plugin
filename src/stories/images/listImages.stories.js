import React from 'react'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { addStoriesFromModule, range } from '../helpers'
import fakeImage from './fakeImage'
import { ImageList } from 'openstack/components/images/ImageListContainer'

const addStories = addStoriesFromModule(module)
const addAction = null
const deleteAction = action('Delete image')

const someImages = range(3).map(fakeImage)

addStories('Images/Listing images', {
  'With no images': () => (
    <ImageList data={[]} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With some images': () => (
    <ImageList data={someImages} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With pagination': () => {
    const numImages = number('numImages', 7, { range: true, min: 0, max: 15, step: 1 })
    const images = range(numImages).map(fakeImage)
    return (
      <ImageList data={images} onAdd={addAction} onDelete={deleteAction} />
    )
  },
})

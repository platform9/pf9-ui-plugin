import React from 'react'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { addStories, range } from '../helpers'
import fakeGlanceImage from './fakeGlanceImage'
import GlanceImageList from 'openstack/components/glanceimages/GlanceImageList'

const addAction = null
const deleteAction = action('Delete glance image')

const someGlanceImages = range(3).map(fakeGlanceImage)

addStories('Glance Images/Listing glance images', {
  'With no images': () => (
    <GlanceImageList glanceImages={[]} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With some images': () => (
    <GlanceImageList glanceImages={someGlanceImages} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With pagination': () => {
    const numGlanceImages = number('numGlanceImages', 7, { range: true, min: 0, max: 15, step: 1 })
    const glanceImages = range(numGlanceImages).map(fakeGlanceImage)
    return (
      <GlanceImageList glanceImages={glanceImages} onAdd={addAction} onDelete={deleteAction} />
    )
  },
})

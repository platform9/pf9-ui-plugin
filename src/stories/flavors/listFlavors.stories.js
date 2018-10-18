import React from 'react'
import { linkTo } from '@storybook/addon-links'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { addStories, range } from '../helpers'
import fakeFlavor from './fakeFlavor'
import { FlavorsList } from 'openstack/components/flavors/FlavorsListPage'

const addAction = linkTo('Flavor Management/Adding a flavor', 'Add a flavor')
const someFlavors = range(3).map(fakeFlavor)
const deleteAction = action('Delete flavor')

addStories('Flavor Management/Listing flavors', {
  'With no flavors': () => (
    <FlavorsList data={[]} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With some flavors': () => (
    <FlavorsList data={someFlavors} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With pagination': () => {
    const numFlavors = number('numFlavors', 7, { range: true, min: 0, max: 15, step: 1 })
    const flavors = range(numFlavors).map(fakeFlavor)
    return (
      <FlavorsList data={flavors} onAdd={addAction} onDelete={deleteAction} />
    )
  },
})

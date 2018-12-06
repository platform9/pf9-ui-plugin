import React from 'react'
import { linkTo } from '@storybook/addon-links'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { addStoriesFromModule, range } from '../helpers'
import fakeRouter from './fakeRouter'
import { RoutersList } from 'openstack/components/routers/RoutersListPage'

const addStories = addStoriesFromModule(module)
const addAction = linkTo('Router Management/Adding a router', 'Add a router')
const someRouters = range(3).map(fakeRouter)
const deleteAction = action('Delete router')

addStories('Router Management/Listing routers', {
  'With no routers': () => (
    <RoutersList data={[]} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With some routers': () => (
    <RoutersList data={someRouters} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With pagination': () => {
    const numRouters = number('numRouters', 7, { range: true, min: 0, max: 15, step: 1 })
    const routers = range(numRouters).map(fakeRouter)
    return (
      <RoutersList data={routers} onAdd={addAction} onDelete={deleteAction} />
    )
  },
})

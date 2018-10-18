import React from 'react'
import { linkTo } from '@storybook/addon-links'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import { addStories, range } from '../helpers'
import fakeUser from './fakeUser'
import { UsersList } from 'openstack/components/users/UsersListPage'

const addAction = linkTo('Users management/Adding a user', 'Add a user')
const deleteAction = action('Delete user')

const someUsers = range(3).map(fakeUser)

addStories('User management/Listing users', {
  'With no users': () => (
    <UsersList data={[]} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With some users': () => (
    <UsersList data={someUsers} onAdd={addAction} onDelete={deleteAction} />
  ),

  'With pagination': () => {
    const numUsers = number('numUsers', 7, { range: true, min: 0, max: 15, step: 1 })
    const users = range(numUsers).map(fakeUser)
    return (
      <UsersList data={users} onAdd={addAction} onDelete={deleteAction} />
    )
  },
})

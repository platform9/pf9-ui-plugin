import React from 'react'
import ListTable from 'core/common/list_table/ListTable'
import ReplayIcon from '@material-ui/icons/Replay'
import { action } from '@storybook/addon-actions'
import { addStories, randomInt } from '../helpers'
import { range } from 'ramda'
import faker from 'faker'
import moment from 'moment'

const onAdd = action('add')
const onDelete = action('delete')
const onEdit = action('edit')
const onRestart = action('restart')

const columns = [
  { id: 'id', label: 'ID', display: 'excluded' },
  { id: 'uuid', label: 'UUID', display: false },
  { id: 'name', label: 'Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'email', label: 'Email' },
  { id: 'date', label: 'Date' },
  { id: 'address', label: 'Address', display: false },
  { id: 'description', label: 'Description', display: false },
]

const data = range(1, randomInt(20, 30)).map(id => ({
  id,
  uuid: faker.random.uuid(),
  name: faker.name.findName(),
  phone: faker.phone.phoneNumber(),
  email: faker.internet.email(),
  date: moment(faker.date.past()).format('LL'),
  address: faker.address.streetAddress(),
  description: faker.lorem.sentence()
}))

const rowActions = [
  { icon: <ReplayIcon />, label: 'Restart', action: onRestart }
]

const actions = { onAdd, onDelete, onEdit }

const DefaultListTable = props =>
  <ListTable title="Example table" columns={columns} data={data} {...props} />

addStories('Common Components/ListTable', {
  'Minimal use case': () => (
    <DefaultListTable {...actions} />
  ),

  'w/o checkboxes': () => (
    <DefaultListTable showCheckboxes={false} />
  ),

  'w/ row actions': () => (
    <DefaultListTable rowActions={rowActions} />
  ),

  'w/ columns selection': () => (
    <DefaultListTable editableColumns rowActions={rowActions} />
  ),

  'Sortable': () => (
    <DefaultListTable sortable rowActions={rowActions} />
  )
})

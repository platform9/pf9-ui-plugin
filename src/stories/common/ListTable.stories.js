import React from 'react'
import ListTable from 'core/common/list_table/ListTable'
import ReplayIcon from '@material-ui/icons/Replay'
import { action } from '@storybook/addon-actions'
import { addStories, randomInt } from '../helpers'
import { max, min, pluck, range } from 'ramda'
import faker from 'faker'
import moment from 'moment'
import { formattedValue } from 'core/common/formatters'

const onAdd = action('add')
const onDelete = action('delete')
const onEdit = action('edit')
const onRestart = action('restart')

const columns = [
  {id: 'id', label: 'ID', excluded: true},
  {id: 'uuid', label: 'UUID', display: false},
  {id: 'name', label: 'Name'},
  {id: 'phone', label: 'Phone'},
  {id: 'email', label: 'Email'},
  {
    id: 'date',
    label: 'Date',
    render: value => moment(value).format('LL'),
    sortWith: (prevDate, nextDate) =>
      moment(prevDate).isBefore(nextDate) ? 1 : -1
  },
  {
    id: 'storage',
    label: 'Storage',
    render: value => formattedValue(value),
    sortWith: (prevValue, nextValue) =>
      +prevValue > +nextValue ? 1 : -1
  },
  {id: 'description', label: 'Description', sort: false, display: false},
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
  {icon: <ReplayIcon />, label: 'Restart', action: onRestart}
]

const actions = {onAdd, onDelete, onEdit}

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
    <DefaultListTable
      canEditColumns
      rowActions={rowActions} />
  ),

  'w/ columns ordering': () => (
    <DefaultListTable canEditColumns canDragColumns rowActions={rowActions} />
  )
})

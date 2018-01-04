import React from 'react'
import ListTable from 'core/components/listTable/ListTable'
import ReplayIcon from '@material-ui/icons/Replay'
import { action } from '@storybook/addon-actions'
import { addStoriesFromModule, randomInt } from '../helpers'
import { pluck, propOr, range } from 'ramda'
import faker from 'faker'
import moment from 'moment'
import { formattedValue } from 'core/util/formatters'
import { isNumeric } from 'utils/misc'
import { TextField } from '@material-ui/core'

const addStories = addStoriesFromModule(module)

const onAdd = action('add')
const onDelete = action('delete')
const onEdit = action('edit')
const onRestart = action('restart')

const columns = [
  { id: 'id', label: 'ID', excluded: true },
  { id: 'uuid', label: 'UUID', display: false },
  { id: 'name', label: 'Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'email', label: 'Email' },
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
  { id: 'description', label: 'Description', sort: false, display: false },
  { id: 'active', label: 'Active', sort: false, display: false }
]

const data = range(1, randomInt(20, 30)).map(id => ({
  id,
  uuid: faker.random.uuid(),
  name: faker.name.findName(),
  phone: faker.phone.phoneNumber(),
  email: faker.internet.email(),
  date: faker.date.past(),
  storage: faker.finance.amount(),
  description: faker.lorem.sentence(),
  active: faker.random.boolean()
}))

const rowActions = [
  { icon: <ReplayIcon />, label: 'Restart', action: onRestart }
]

const actions = { onAdd, onDelete, onEdit }

const filters = [
  {
    columnId: 'email',
    type: 'select',
    items: pluck('email', data),
  },
  {
    columnId: 'name',
    type: 'multiselect',
    label: 'Names', // Override column label
    items: pluck('name', data),
  },
  {
    columnId: 'storage',
    type: 'custom',
    filterWith: ({ min, max }, storage) =>
      (!isNumeric(min) || +storage >= +min) &&
      (!isNumeric(max) || +storage <= +max),
    // Custom filter control
    render: ({ value, onChange }) => <div>
      <TextField label="Min storage" type="number"
        InputLabelProps={{ shrink: true }}
        value={propOr('', 'min', value)}
        onChange={e => onChange({ ...value, min: e.target.value })} />
      <TextField label="Min storage" type="number"
        InputLabelProps={{ shrink: true }}
        value={propOr('', 'max', value)}
        onChange={e => onChange({ ...value, max: e.target.value })} />
    </div>,
  },
  {
    columnId: 'active',
    type: 'checkbox',
  }
]

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
    <DefaultListTable
      editableColumns
      draggableColumns
      rowActions={rowActions} />
  ),

  'w/ filters': () => (
    <DefaultListTable
      filters={filters}
      rowActions={rowActions} />
  )
})

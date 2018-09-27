import React from 'react'
import ListTable from 'core/common/ListTable'
import ReplayIcon from '@material-ui/icons/Replay'
import { action } from '@storybook/addon-actions'
import { addStories } from '../helpers'

const onAdd = action('add')
const onDelete = action('delete')
const onEdit = action('edit')
const onRestart = action('restart')

const columns = [
  { id: 'word', label: 'Word' },
  { id: 'integer', label: 'Integer' },
]

const data = [
  { word: 'one', integer: 1 },
  { word: 'two', integer: 2 },
  { word: 'three', integer: 3 },
]

const rowActions = [
  { icon: <ReplayIcon />, label: 'Restart', action: onRestart }
]

const actions = { onAdd, onDelete, onEdit }

addStories('Common Components/ListTable', {
  'Minimal use case': () => (
    <ListTable title="Numbers" columns={columns} data={data} {...actions} />
  ),

  'w/o checkboxes': () => (
    <ListTable title="Numbers" columns={columns} data={data} showCheckboxes={false} />
  ),

  'w/ row actions': () => (
    <ListTable title="Numbers" columns={columns} data={data} rowActions={rowActions} />
  )
})

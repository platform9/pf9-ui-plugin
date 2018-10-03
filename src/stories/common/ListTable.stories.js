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
  { id: 'id', label: 'integer' },
  { id: 'word', label: 'word' },
]

const data = [
  { id: 1, word: 'one' },
  { id: 2, word: 'two' },
  { id: 3, word: 'three' },
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

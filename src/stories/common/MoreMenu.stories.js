import React from 'react'
import MoreMenu from 'core/common/MoreMenu'
import { action } from '@storybook/addon-actions'
import { addStories } from '../helpers'

const onAdd = action('add')
const onDelete = action('delete')
const onEdit = action('edit')
const onRestart = action('restart')

const handleSelect = action('selected')

const items = [
  { label: 'Add', action: onAdd },
  { label: 'Delete', action: onDelete },
  { label: 'Edit', action: onEdit },
  { label: 'Restart', action: onRestart },
]

addStories('Common Components/MoreMenu', {
  'Specifying menu actions': () => (
    <MoreMenu items={items} onSelect={handleSelect} />
  )
})

import React from 'react'
import ReplayIcon from '@material-ui/icons/Replay'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import MoreMenu from 'core/common/MoreMenu'
import { action } from '@storybook/addon-actions'
import { addStories } from '../helpers'

const onAdd = action('add')
const onDelete = action('delete')
const onEdit = action('edit')
const onRestart = action('restart')

const items = [
  { label: 'Add', action: onAdd },
  { label: 'Delete', action: onDelete },
  { label: 'Edit', action: onEdit },
  { label: 'Restart', action: onRestart },
]

const iconItems = [
  { icon: <PlayArrowIcon />, label: 'Play', action: action('play') },
  { icon: <ReplayIcon />, label: 'Replay', action: action('replay') },
]

addStories('Common Components/MoreMenu', {
  'Specifying menu actions': () => (
    <MoreMenu items={items} />
  ),

  'w/ icons': () => (
    <MoreMenu items={iconItems} />
  )
})

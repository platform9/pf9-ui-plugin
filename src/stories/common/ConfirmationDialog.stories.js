import React from 'react'
import { action } from '@storybook/addon-actions'
import { addStoriesFromModule } from '../helpers'

import ConfirmationDialog from 'core/components/ConfirmationDialog'

const addStories = addStoriesFromModule(module)

const handleCancel = action('canceled')
const handleConfirm = action('confirmed')

addStories('Common Components/ConfirmationDialog', {
  'Default settings (closed)': () => (
    <ConfirmationDialog open={false} />
  ),

  'Default settings (open)': () => (
    <ConfirmationDialog open />
  ),

  Callbacks: () => (
    <ConfirmationDialog open onCancel={handleCancel} onConfirm={handleConfirm} />
  ),

  'Custom title': () => (
    <ConfirmationDialog open title="Custom title" />
  ),

  'Custom text': () => (
    <ConfirmationDialog
      open
      text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    />
  ),

  'Custom buttons': () => (
    <ConfirmationDialog
      open
      cancelText="No, get me out of here!"
      confirmText="Yes, I'm sure!"
    />
  )
})

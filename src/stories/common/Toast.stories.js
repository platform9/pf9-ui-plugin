import React from 'react'
import { addStoriesFromModule } from '../helpers'
import { withToast } from 'core/common/ToastProvider'
import Button from '@material-ui/core/Button/Button'

const addStories = addStoriesFromModule(module)

const ComponentWithToast = withToast(props =>
  <div>
    <Button onClick={() => props.showToast('Hello world')}>
      Open info toast
    </Button>
    <Button onClick={() => props.showToast('Hello world', 'success')}>
      Open success toast
    </Button>
    <Button onClick={() => props.showToast('Hello world', 'warning')}>
      Open warning toast
    </Button>
    <Button onClick={() => props.showToast('Hello world', 'error')}>
      Open error toast
    </Button>
  </div>)

addStories('Common Components/Toast', {
  'Default': () => (
    <ComponentWithToast />
  ),
})

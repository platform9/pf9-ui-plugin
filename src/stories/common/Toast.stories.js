import React from 'react'
import { addStoriesFromModule } from '../helpers'
import { useToast } from 'core/providers/ToastProvider'
import Button from '@material-ui/core/Button/Button'

const addStories = addStoriesFromModule(module)

const ComponentWithToast = () => {
  const showToast = useToast()
  return <div>
    <Button onClick={() => showToast('Hello world')}>
      Open info toast
    </Button>
    <Button onClick={() => showToast('Hello world', 'success')}>
      Open success toast
    </Button>
    <Button onClick={() => showToast('Hello world', 'warning')}>
      Open warning toast
    </Button>
    <Button onClick={() => showToast('Hello world', 'error')}>
      Open error toast
    </Button>
  </div>
}

addStories('Common Components/Toast', {
  Default: () => (
    <ComponentWithToast />
  ),
})

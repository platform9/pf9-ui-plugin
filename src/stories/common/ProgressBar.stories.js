import React from 'react'
import { addStoriesFromModule } from '../helpers'
import ProgressBar from 'core/components/ProgressBar'

const addStories = addStoriesFromModule(module)

addStories('Common Components/ProgressBar', {
  'Progress bar': () => (
    <ProgressBar percent={40} label={progress => `${progress}% used`} />
  ),
  'Compact': () => (
    <ProgressBar
      compact
      percent={40}
      label={progress =>
        <span><strong>{progress}%</strong>{'- 5.7/19.3GB used'}</span>} />
  ),
})

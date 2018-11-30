import React from 'react'
import { addStories } from '../helpers'
import ProgressBar from 'core/common/ProgressBar'

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

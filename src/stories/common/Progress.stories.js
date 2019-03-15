import React from 'react'
import { addStoriesFromModule } from '../helpers'

import Progress from 'core/components/Progress'

const addStories = addStoriesFromModule(module)

addStories('Common Components/Progress', {
  'Default settings': () => (
    <Progress />
  ),

  'Custom message': () => (
    <Progress message="Fetching data..." />
  ),
})

import React from 'react'
import { addStoriesFromModule } from '../../helpers'

import CreateButton from 'core/components/buttons/CreateButton'

const addStories = addStoriesFromModule(module)

addStories('Common Components/Buttons', {
  'Create Button': () => (
    <CreateButton>Add Cluster</CreateButton>
  ),
})

import React from 'react'
import { addStories } from '../helpers'

import Loader from 'core/common/Loader'

addStories('Common Components/Loader', {
  'Default settings': () => <Loader />,

  'Custom message': () => <Loader message="Fetching data..." />,
})

import React from 'react'
import { addStories } from '../helpers'
import SemiCircle from 'core/common/dashboard_graphs/SemiCircle'

addStories('Charts', {
  'SemiCircle': () => (
    <SemiCircle
      label="0.7 GHz used / 13.2 GHz"
      percentage={72} />
  )
})

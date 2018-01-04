import React from 'react'
import UsageBar from 'core/components/dashboardGraphs/UsageBar'
import { addStoriesFromModule } from '../helpers'

const addStories = addStoriesFromModule(module)

addStories('Charts', {
  'UsageBar': () => (
    <UsageBar
      percision={2}
      stats={{
        current: 1.2,
        max: 4.6,
        percent: 26.1,
        type: 'used',
        units: 'Ghz',
      }}
    />
  )
})

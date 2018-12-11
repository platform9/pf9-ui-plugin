import React from 'react'
import UsageWidget from 'core/common/dashboard_graphs/UsageWidget'
import { addStoriesFromModule } from '../helpers'

const addStories = addStoriesFromModule(module)

addStories('Charts', {
  'UsageWidget': () => (
    <UsageWidget
      percision={1}
      title="Compute"
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

import React from 'react'
import SemiCircleGraph from 'core/components/graphs/SemiCircleGraph'
import { addStoriesFromModule } from '../helpers'

const addStories = addStoriesFromModule(module)

addStories('Charts', {
  SemiCircle: () => (
    <SemiCircleGraph
      label="0.7 GHz used / 13.2 GHz"
      percentage={70} />
  )
})

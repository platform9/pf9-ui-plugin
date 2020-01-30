import React from 'react'
import SquaresGraph from 'core/components/graphs/SquaresGraph'
import { addStoriesFromModule } from '../helpers'

const addStories = addStoriesFromModule(module)

addStories('Charts', {
  Squares: () => (
    <SquaresGraph
      num={13} label={'13 active networks'} />
  )
})

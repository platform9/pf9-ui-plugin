import React from 'react'
import { addStoriesFromModule, range } from '../helpers'
import fakeProgressTrackerItem from './fakeProgressTrackerItem'
import ProgressTracker from 'core/components/progress/ProgressTracker'

const addStories = addStoriesFromModule(module)

const someProgressTrackerItems = range(3).map(fakeProgressTrackerItem)
const activeStep1 = 1

addStories('Common Components/Progress Tracker', {
  '3 random steps': () => (
    <ProgressTracker steps={someProgressTrackerItems} activeStep={activeStep1} />
  ),
})

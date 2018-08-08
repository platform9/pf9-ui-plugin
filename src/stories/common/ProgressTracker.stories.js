import React from 'react'
import { range, addStories } from '../helpers'
import fakeProgressTrackerItem from './fakeProgressTrackerItem'
import ProgressTracker from 'core/common/ProgressTracker'

const someProgressTrackerItems = range(3).map(fakeProgressTrackerItem)
const activeStep1 = 1

addStories('Common Components/Progress Tracker', {
  '3 random steps': () => (
    <ProgressTracker steps={someProgressTrackerItems} activeStep={activeStep1} />
  ),
})

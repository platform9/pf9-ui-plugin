import React from 'react'
import { range, addStories } from '../helpers'

import { BrowserRouter as Router } from 'react-router-dom'
import fakeNavbarItem from './fakeNavbarItem'
import Navbar from 'core/common/Navbar'

const someNavbarItems = range(5).map(fakeNavbarItem)

addStories('Common Components/Navbar', {
  'Random links': () => (
    <div>
      <Router>
        <Navbar links={someNavbarItems} />
      </Router>
    </div>
  ),
})

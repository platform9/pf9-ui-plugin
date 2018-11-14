import React from 'react'
import { addStories, randomInt, range } from '../helpers'

import { BrowserRouter as Router } from 'react-router-dom'
import fakeNavbarItem from './fakeNavbarItem'
import Navbar from 'core/common/Navbar'
import { omit } from 'ramda'

const someNavbarItems = range(5).map(fakeNavbarItem)

const categories = ['Infrastructure', 'Clusters', 'Nodes', 'Providers']
const maxChildren = 5
const categorizedItems = categories.map(category => ({
  name: category,
  nestedLinks: range(randomInt(1, maxChildren)).map(fakeNavbarItem),
}))

addStories('Common Components/Navbar', {
  'Random links': () => (
    <div>
      <Router>
        <Navbar links={someNavbarItems.map(omit(['icon']))} />
      </Router>
    </div>
  ),
  'With icons': () => (
    <div>
      <Router>
        <Navbar links={someNavbarItems} />
      </Router>
    </div>
  ),
  'With categories': () => (
    <div>
      <Router>
        <Navbar links={categorizedItems} />
      </Router>
    </div>
  ),
  'With search bar': () => (
    <div>
      <Router>
        <Navbar withSearchBar links={categorizedItems} />
      </Router>
    </div>
  )
})

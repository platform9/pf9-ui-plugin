import React from 'react'
import faker from 'faker'
import { addStories, randomInt, range } from '../helpers'

import { BrowserRouter as Router } from 'react-router-dom'
import fakeNavbarItem from './fakeNavbarItem'
import { omit } from 'ramda'
import Navbar from 'core/common/Navbar'

const getSomeNavbarItems = (count = 5) => range(count).map(fakeNavbarItem)

const categories = ['Infrastructure', 'Clusters', 'Nodes', 'Providers']
const getCategorizedItems = () => categories.map(category => ({
  name: category,
  nestedLinks: getSomeNavbarItems(randomInt(1, 5)),
}))

const sections = range(4).map(() => ({
  id: faker.random.uuid(),
  name: faker.random.word(),
  links: getCategorizedItems(),
}))

addStories('Common Components/Navbar', {
  'Random links': () => (
    <Router>
      <Navbar sections={[{links: getSomeNavbarItems().map(omit(['icon']))}]} />
    </Router>
  ),
  'With icons': () => (
    <Router>
      <Navbar sections={[{links: getSomeNavbarItems()}]} />
    </Router>
  ),
  'With categories': () => (
    <Router>
      <Navbar sections={[{links: getCategorizedItems()}]} />
    </Router>
  ),
  'With search bar': () => (
    <Router>
      <Navbar withSearchBar sections={[{links: getCategorizedItems()}]} />
    </Router>
  ),
  'Accordion with sections': () => (
    <Router>
      <Navbar withSearchBar sections={sections} />
    </Router>
  )
})

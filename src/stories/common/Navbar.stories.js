import React from 'react'
import faker from 'faker'
import { addStoriesFromModule, randomInt, range } from '../helpers'

import { BrowserRouter as Router } from 'react-router-dom'
import fakeNavbarItem from './fakeNavbarItem'
import { omit } from 'ramda'
import Navbar from 'core/components/Navbar'

const addStories = addStoriesFromModule(module)

const getSomeNavbarItems = (withIcons, count = 5) =>
  range(count).map(fakeNavbarItem(withIcons))

const categories = ['Infrastructure', 'Clusters', 'Nodes', 'Providers']
const getCategorizedItems = withIcons => categories.map(category => ({
  ...fakeNavbarItem(withIcons)(),
  name: category,
  nestedLinks: getSomeNavbarItems(withIcons, randomInt(1, 5)),
}))

const getSections = withIcons => range(4).map(() => ({
  id: faker.random.uuid(),
  name: faker.random.word(),
  links: getCategorizedItems().map(omit(['icon'])),
}))

addStories('Common Components/Navbar', {
  'Random links': () => (
    <Router>
      <Navbar sections={[{ links: getSomeNavbarItems() }]} />
    </Router>
  ),
  'w/ icons': () => (
    <Router>
      <Navbar sections={[{ links: getSomeNavbarItems(true) }]} />
    </Router>
  ),
  'w/ categories': () => (
    <Router>
      <Navbar sections={[{ links: getCategorizedItems() }]} />
    </Router>
  ),
  'w/ categories + icons': () => (
    <Router>
      <Navbar sections={[{ links: getCategorizedItems(true) }]} />
    </Router>
  ),
  'Accordion w/ sections': () => (
    <Router>
      <Navbar sections={getSections()} />
    </Router>
  ),
  'Accordion w/ sections + icons': () => (
    <Router>
      <Navbar sections={getSections(true)} />
    </Router>
  )
})

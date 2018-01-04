import React from 'react'
import { addStoriesFromModule } from '../helpers'
import Tabs from 'core/components/Tabs'
import Tab from 'core/components/Tab'

const addStories = addStoriesFromModule(module)

const First = () => <h1>First tab contents</h1>

addStories('Common Components/Tabs', {
  'Specifying tabs': () => (
    <Tabs>
      <Tab value="first" label="First one"><First /></Tab>
      <Tab value="second" label="Another tab">
        <div>
          <h1>Another tab contents</h1>
        </div>
      </Tab>
    </Tabs>
  )
})

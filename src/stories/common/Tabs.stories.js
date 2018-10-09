import React from 'react'
import { addStories } from '../helpers'
import Tabs from 'core/common/Tabs'
import Tab from 'core/common/Tab'

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

import React from 'react'
import Panel from '../Panel'
import Tab from 'core/components/tabs/Tab'
import Tabs from 'core/components/tabs/Tabs'
import { Typography } from '@material-ui/core'

const TabsExample = ({ expanded = false }) => (
  <Panel title="Tabs" defaultExpanded={expanded}>
    <Tabs>
      <Tab value="first" label="First one">
        <Typography variant="subtitle1">First tab contents</Typography>
      </Tab>
      <Tab value="second" label="Second">
        <Typography variant="subtitle1">Second tab contents</Typography>
      </Tab>
    </Tabs>
  </Panel>
)

export default TabsExample

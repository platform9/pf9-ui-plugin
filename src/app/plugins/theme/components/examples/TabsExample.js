import React from 'react'
import Panel from '../Panel'
import Tab from 'core/components/tabs/Tab'
import Tabs from 'core/components/tabs/Tabs'
import Text from 'core/elements/text'

const TabsExample = ({ expanded = false }) => (
  <Panel title="Tabs" defaultExpanded={expanded}>
    <Tabs>
      <Tab value="first" label="First one">
        <Text variant="subtitle1">First tab contents</Text>
      </Tab>
      <Tab value="second" label="Second">
        <Text variant="subtitle1">Second tab contents</Text>
      </Tab>
    </Tabs>
  </Panel>
)

export default TabsExample

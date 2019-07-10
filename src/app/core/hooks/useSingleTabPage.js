import React from 'react'
import Tabs from 'core/components/Tabs'
import Tab from 'core/components/Tab'

// This components exists solely to make creating a page with a single tab easier.
const useSingleTabPage = (tabValue, tabLabel, children) => () => (
  <Tabs>
    <Tab value={tabValue} label={tabLabel}>{children}</Tab>
  </Tabs>
)

export default useSingleTabPage

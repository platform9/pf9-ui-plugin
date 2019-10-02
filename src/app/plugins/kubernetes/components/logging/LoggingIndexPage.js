import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import LoggingListPage from './LoggingListPage'

const LoggingIndexPage = () => (
  <Tabs>
    <Tab value="logging" label="Logging"><LoggingListPage /></Tab>
  </Tabs>
)

export default LoggingIndexPage

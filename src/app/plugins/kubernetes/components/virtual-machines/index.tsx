import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import PageContainer from 'core/components/pageContainer/PageContainer'
import VirtualMachinesListPage from './list-page'

const VirtualMachinesPage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="virtual-machines" label="VM Instances">
        <VirtualMachinesListPage />
      </Tab>
      <Tab value="data-volumes" label="Data Volumes">
        <div>Coming soon</div>
      </Tab>
      {/* <Tab value="presets" label="Presets">
        <div>Coming soon</div>
      </Tab>
      <Tab value="snapshots" label="Snapshots">
        <div>Coming soon</div>
      </Tab> */}
    </Tabs>
  </PageContainer>
)

export default VirtualMachinesPage

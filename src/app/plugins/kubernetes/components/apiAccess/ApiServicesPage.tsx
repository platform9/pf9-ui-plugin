import PageContainer from 'core/components/pageContainer/PageContainer'
import Tab from 'core/components/tabs/Tab'
import Tabs from 'core/components/tabs/Tabs'
import React from 'react'
import { capitalizeString } from 'utils/misc'
import ApiDetailsPage from './ApiDetailsPage'

const ApiServicesPage = () => {
  const services = ['appbert', 'keystone', 'qbert', 'resmgr']

  return (
    <PageContainer>
      <Tabs>
        {services.map((service) => (
          <Tab value={service} label={capitalizeString(service)}>
            <ApiDetailsPage service={service}></ApiDetailsPage>
          </Tab>
        ))}
      </Tabs>
    </PageContainer>
  )
}

export default ApiServicesPage

import PageContainer from 'core/components/pageContainer/PageContainer'
import Tab from 'core/components/tabs/Tab'
import Tabs from 'core/components/tabs/Tabs'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'
import { pluck } from 'ramda'
import React from 'react'
import { capitalizeString } from 'utils/misc'
import ApiDetailsPage from './ApiDetailsPage'

const ApiServicesPage = () => {
  const devEnabled = window.localStorage.enableDevPlugin === 'true'
  const [serviceCatalog] = useDataLoader(loadServiceCatalog)
  let whitelist = ['keystone', 'qbert']

  // Only expose these services in the dev plugin
  const devOnlyServices = ['appbert', 'resmgr']
  if (devEnabled) {
    whitelist = whitelist.concat(devOnlyServices)
  }

  const services = pluck(
    'name',
    serviceCatalog.filter((service) => whitelist.includes(service.name)),
  ).sort()

  return (
    <PageContainer>
      <Tabs>
        {services.map((service) => (
          <Tab key={service} value={service} label={capitalizeString(service)}>
            <ApiDetailsPage service={service}></ApiDetailsPage>
          </Tab>
        ))}
      </Tabs>
    </PageContainer>
  )
}

export default ApiServicesPage

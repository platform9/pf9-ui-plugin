import React from 'react'
import { addStories, range } from '../helpers'
import fakeService from './fakeService'
import { ServiceCatalogList } from 'openstack/components/api-access/ApiAccessListPage'

const someServices = range(15).map(fakeService)

addStories('Service Catalog/Listing services', {
  'With some services': () => (
    <ServiceCatalogList services={someServices} />
  ),
})

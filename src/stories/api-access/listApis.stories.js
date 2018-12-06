import React from 'react'
import { addStoriesFromModule, range } from '../helpers'
import fakeService from './fakeService'
import { ServiceCatalogList } from 'openstack/components/api-access/ApiAccessListPage'

const addStories = addStoriesFromModule(module)
const someServices = range(15).map(fakeService)

addStories('Service Catalog/Listing services', {
  'With some services': () => (
    <ServiceCatalogList services={someServices} />
  ),
})

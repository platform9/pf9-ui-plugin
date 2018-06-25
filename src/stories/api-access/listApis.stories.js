import React from 'react'
import { addStories, range } from '../helpers'
import fakeService from './fakeService'
import ApiAccessList from 'openstack/components/api-access/ApiAccessList'

const someServices = range(15).map(fakeService)

addStories('Service Catalog/Listing services', {
  'With some services': () => (
    <ApiAccessList catalog={someServices} />
  ),
})

import React from 'react'
import { compose } from 'core/../../../../utils/fp'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { loadServiceCatalog } from './actions'
import createListTableComponent from 'core/helpers/createListTableComponent'

const columns = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Name' },
  { id: 'type', label: 'Type' },
  { id: 'url', label: 'URL' },
  { id: 'iface', label: 'Interface' },
]

const ListTable = createListTableComponent({
  title: 'API Endpoints',
  emptyText: 'No services found.',
  name: 'ApiAccessList',
  columns,
  paginate: false,
  showCheckboxes: false,
})

const ApiAccessPage = () => {
  return (
    <DataLoader dataKey="serviceCatalog" loaderFn={loadServiceCatalog}>
      {({ data }) => <ListTable data={data} />}
    </DataLoader>
  )
}

export default compose(
  requiresAuthentication,
)(ApiAccessPage)

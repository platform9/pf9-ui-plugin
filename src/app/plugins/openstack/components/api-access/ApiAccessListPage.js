import { compose } from 'app/utils/fp'
import DataLoader from 'core/DataLoader'
import createListTableComponent from 'core/helpers/createListTableComponent'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import React from 'react'
import { loadServiceCatalog } from './actions'

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

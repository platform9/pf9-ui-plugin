import React from 'react'
import { compose } from 'core/fp'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { loadServiceCatalog } from './actions'
import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Name' },
  { id: 'type', label: 'Type' },
  { id: 'url', label: 'URL' },
  { id: 'iface', label: 'Interface' },
]

export const ServiceCatalogList = ({ services }) => {
  return (
    <ListTable
      title="API Endpoints"
      columns={columns}
      data={services}
      paginate={false}
      showCheckboxes={false}
      searchTarget="name"
    />
  )
}

const ApiAccessPage = () => {
  return (
    <DataLoader dataKey="serviceCatalog" loaderFn={loadServiceCatalog}>
      {({ data }) => <ServiceCatalogList services={data} />}
    </DataLoader>
  )
}

export default compose(
  requiresAuthentication,
)(ApiAccessPage)

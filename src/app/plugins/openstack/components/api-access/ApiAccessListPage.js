import React from 'react'
import { compose } from 'core/fp'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { loadServiceCatalog } from './actions'
import ListTable from 'core/common/list_table/ListTable'
import { pluck } from 'ramda'
import { pluckVisibleColumnIds } from '../../../../core/common/list_table/ListTable'
import { withScopedPreferences } from 'core/helpers/PreferencesProvider'

const columns = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Name' },
  { id: 'type', label: 'Type' },
  { id: 'url', label: 'URL' },
  { id: 'iface', label: 'Interface' },
]

const ServiceCatalogList = withScopedPreferences('ApiAccessList')(({
  services,
  preferences: { visibleColumns, columnsOrder, rowsPerPage },
  updatePreferences
}) => (
  !services || services.length === 0
    ? <h1>No services found.</h1>
    : <ListTable
      title="API Endpoints"
      columns={columns}
      data={services}
      paginate={false}
      showCheckboxes={false}
      searchTarget="name"
      onRowsPerPageChange={rowsPerPage => updatePreferences({ rowsPerPage })}
      onColumnsChange={updatedColumns => updatePreferences({
        visibleColumns: pluckVisibleColumnIds(updatedColumns),
        columnsOrder: pluck('id', updatedColumns)
      })}
    />
))

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

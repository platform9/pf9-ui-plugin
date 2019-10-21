import React from 'react'
import { withRouter } from 'react-router-dom'
import ListTable from 'core/components/listTable/ListTable'
import { withScopedPreferences } from 'core/providers/PreferencesProvider'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import { compose } from 'ramda'

const createListTableComponent = ({
  title,
  emptyText = 'No data found.',
  name,
  displayName = name,
  columns,
  uniqueIdentifier = 'id',
  searchTarget = 'name',
  paginate,
  showCheckboxes,
  onReload,
  onRefresh,
}) => {
  const CustomListTable = ({
    data,
    onAdd,
    onDelete,
    onEdit,
    rowActions,
    preferences: { visibleColumns, columnsOrder, rowsPerPage },
    updatePreferences
  }) => (!data || data.length === 0
    ? <h1>{emptyText}</h1>
    : <ListTable
      title={title}
      columns={columns}
      data={data}
      onAdd={onAdd}
      onDelete={onDelete}
      onEdit={onEdit}
      rowActions={rowActions}
      paginate={paginate}
      showCheckboxes={showCheckboxes}
      searchTarget={searchTarget}
      visibleColumns={visibleColumns}
      columnsOrder={columnsOrder}
      rowsPerPage={rowsPerPage}
      onReload={onReload}
      onRefresh={onRefresh}
      onRowsPerPageChange={rowsPerPage => updatePreferences({ rowsPerPage })}
      onColumnsChange={updatePreferences}
      uniqueIdentifier={uniqueIdentifier}
    />)

  CustomListTable.displayName = displayName

  return compose(
    withRouter,
    requiresAuthentication,
    withScopedPreferences(name)
  )(CustomListTable)
}

export default createListTableComponent

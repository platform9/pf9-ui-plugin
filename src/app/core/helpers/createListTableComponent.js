import React from 'react'
import ListTable, { pluckVisibleColumnIds } from 'core/common/list_table/ListTable'
import { compose, pluck } from 'ramda'
import { withScopedPreferences } from 'core/PreferencesProvider'
import { withRouter } from 'react-router-dom'
import requiresAuthentication from 'openstack/util/requiresAuthentication'

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
      onRowsPerPageChange={rowsPerPage => updatePreferences({ rowsPerPage })}
      onColumnsChange={updatedColumns => updatePreferences({
        visibleColumns: pluckVisibleColumnIds(updatedColumns),
        columnsOrder: pluck('id', updatedColumns)
      })} />)

  CustomListTable.displayName = displayName

  return compose(
    withRouter,
    requiresAuthentication,
    withScopedPreferences(name)
  )(CustomListTable)
}

export default createListTableComponent

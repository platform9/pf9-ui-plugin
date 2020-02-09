import React from 'react'
import { withRouter } from 'react-router-dom'
import ListTable from 'core/components/listTable/ListTable'
import { withScopedPreferences } from 'core/providers/PreferencesProvider'
import { compose } from 'ramda'
import NoContentMessage from 'core/components/NoContentMessage'

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
  compactTable = false,
}) => {
  const CustomListTable = ({
    data,
    onAdd,
    onDelete,
    onEdit,
    rowActions,
    preferences: { visibleColumns, columnsOrder, rowsPerPage },
    updatePreferences,
    loading,
    onSortChange,
  }) =>
    !data || data.length === 0 ? (
      typeof emptyText === 'string' ? (
        <NoContentMessage message={emptyText} />
      ) : (
        <NoContentMessage>{emptyText}</NoContentMessage>
      )
    ) : (
      <ListTable
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
        onRowsPerPageChange={(rowsPerPage) => updatePreferences({ rowsPerPage })}
        onColumnsChange={updatePreferences}
        onSortChange={onSortChange}
        uniqueIdentifier={uniqueIdentifier}
        loading={loading}
        compactTable={compactTable}
      />
    )

  CustomListTable.displayName = displayName

  return compose(withRouter, withScopedPreferences(name))(CustomListTable)
}

export default createListTableComponent

import React from 'react'
import ListTable from 'core/components/listTable/ListTable'
import NoContentMessage from 'core/components/NoContentMessage'
import useScopedPreferences from 'core/session/useScopedPreferences'

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
  multiSelection,
  onReload,
  onRefresh,
  compactTable = false,
  batchActions,
}) => {
  const CustomListTable = ({
    data,
    onAdd,
    onDelete,
    onEdit,
    rowActions,
    loading,
    onSortChange,
  }) => {
    const [{ visibleColumns, columnsOrder, rowsPerPage }, updatePrefs] = useScopedPreferences(name)

    return !data || data.length === 0 ? (
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
        multiSelection={multiSelection}
        searchTarget={searchTarget}
        visibleColumns={visibleColumns}
        columnsOrder={columnsOrder}
        rowsPerPage={rowsPerPage}
        onReload={onReload}
        onRefresh={onRefresh}
        onRowsPerPageChange={(rowsPerPage) => updatePrefs({ rowsPerPage })}
        onColumnsChange={updatePrefs}
        onSortChange={onSortChange}
        uniqueIdentifier={uniqueIdentifier}
        loading={loading}
        compactTable={compactTable}
        batchActions={batchActions}
      />
    )
  }

  CustomListTable.displayName = displayName

  return CustomListTable
}

export default createListTableComponent

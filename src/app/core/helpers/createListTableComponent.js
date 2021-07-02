import React from 'react'
import ListTable from 'core/components/listTable/ListTable'
import NoContentMessage from 'core/components/NoContentMessage'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { emptyArr } from 'utils/fp'

const createListTableComponent = ({
  title,
  emptyText = 'No data found.',
  name,
  displayName = name,
  columns,
  uniqueIdentifier = 'id',
  searchTargets = ['name'],
  paginate = true,
  showCheckboxes = true,
  multiSelection = true,
  onReload,
  onRefresh = undefined,
  compactTable = false,
  batchActions = emptyArr,
  filters = undefined,
  showEmptyTableText = true,
}) => {
  const CustomListTable = ({
    data,
    onAdd = undefined,
    onDelete = undefined,
    onEdit = undefined,
    rowActions = undefined,
    loading = false,
    onSortChange = undefined,
    listTableParams = undefined,
  }) => {
    const { prefs, updatePrefs } = useScopedPreferences(name)
    const { visibleColumns, columnsOrder, rowsPerPage } = prefs

    return (!data || data.length === 0) && showEmptyTableText ? (
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
        searchTargets={searchTargets}
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
        listTableParams={listTableParams}
        filters={filters}
      />
    )
  }

  CustomListTable.displayName = displayName

  return CustomListTable
}

export default createListTableComponent

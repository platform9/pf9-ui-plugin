import React, { useCallback } from 'react'
import CRUDListContainer from 'core/components/CRUDListContainer'
import ListTable from 'core/components/listTable/ListTable'
import useDataLoader from 'core/hooks/useDataLoader'
import { getContextLoader } from 'core/helpers/createContextLoader'
import { getContextUpdater } from 'core/helpers/createContextUpdater'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { pick } from 'ramda'
import { listTablePrefs } from 'app/constants'
import PollingData from 'core/components/PollingData'

/**
 * This helper removes a lot of boilerplate from standard CRUD operations.
 *
 * We separate them out into the following components:
 *   - ListPage:
 *       Responsible for fetching the data.  A render prop that receives ({ ListContainer })
 *   - ListContainer:
 *       Responsible for handling CRUD operations (add, delete, update).
 *   - List:
 *       Responsible for specifying the columns and rendering the list.
 *
 * The reason for separating them into 3 different components is so that they
 * can be tested individually; mocks can be substituted for data loading and
 * actions.
 *
 * Please see CRUDListContainer and ListTable for a better understanding what
 * some of the `options` are.
 */

const createCRUDComponents = (options) => {
  const {
    // We can either provide the cacheKey to autoresolve the loader, or the loaderFn/deleteFn functions directly
    cacheKey,
    actions = {
      list: cacheKey ? getContextLoader(cacheKey) : null,
      delete: cacheKey ? getContextUpdater(cacheKey, 'delete') : null,
    },
    loaderFn = actions.list,
    deleteFn = actions.delete,
    deleteCond,
    deleteDisabledInfo,
    defaultParams = {},
    columns = [],
    batchActions = [],
    rowActions = [],
    uniqueIdentifier = 'id',
    addText = 'Add',
    emptyText = 'No data found',
    renderEmptyTable = false,
    addButton,
    addUrl,
    addButtonConfigs,
    AddDialog,
    EditDialog,
    DeleteDialog,
    editUrl,
    editCond,
    editDisabledInfo,
    debug,
    name,
    nameProp,
    searchTargets = ['name'],
    multiSelection = true,
    showCheckboxes,
    headlessTable,
    compactTable,
    blankFirstColumn,
    onSelect,
    extraToolbarContent,
    hideDelete,
    pollingInterval,
    pollingCondition,
  } = options

  // List
  const List = ({
    onDelete,
    onEdit,
    batchActions,
    rowActions,
    data,
    onRefresh,
    onReload,
    loading,
    visibleColumns,
    columnsOrder,
    rowsPerPage,
    orderBy,
    orderDirection,
    getParamsUpdater,
    filters,
    alternativeTableContent,
    ...rest
  }) => {
    return (
      <ListTable
        {...rest}
        onAdd={null}
        emptyText={emptyText}
        renderEmptyTable={renderEmptyTable}
        columns={columns}
        deleteCond={deleteCond}
        deleteDisabledInfo={deleteDisabledInfo}
        editCond={editCond}
        editDisabledInfo={editDisabledInfo}
        multiSelection={multiSelection}
        searchTargets={searchTargets}
        uniqueIdentifier={uniqueIdentifier}
        showCheckboxes={showCheckboxes}
        compactTable={compactTable}
        headless={headlessTable}
        blankFirstColumn={blankFirstColumn}
        loading={loading}
        onReload={onReload}
        onRefresh={onRefresh}
        onSelect={onSelect}
        filters={filters}
        data={data}
        onDelete={onDelete}
        onEdit={onEdit}
        batchActions={batchActions}
        rowActions={rowActions}
        visibleColumns={visibleColumns}
        columnsOrder={columnsOrder}
        rowsPerPage={rowsPerPage}
        orderBy={orderBy}
        orderDirection={orderDirection}
        onSortChange={getParamsUpdater('orderBy', 'orderDirection')}
        onRowsPerPageChange={getParamsUpdater('rowsPerPage')}
        onColumnsChange={getParamsUpdater('visibleColumns', 'columnsOrder')}
        extraToolbarContent={extraToolbarContent}
        hideDelete={hideDelete}
        alternativeTableContent={alternativeTableContent}
      />
    )
  }
  List.displayName = `${name}List`

  // ListContainer
  const ListContainer = ({ data, loading, reload, ...restProps }) => {
    const refetch = useCallback(() => reload(true), [reload])
    return (
      <CRUDListContainer
        nameProp={nameProp}
        items={data}
        reload={reload}
        addText={addText}
        addButton={addButton}
        editUrl={editUrl}
        addUrl={addUrl}
        addButtonConfigs={addButtonConfigs}
        deleteFn={deleteFn}
        uniqueIdentifier={uniqueIdentifier}
        AddDialog={AddDialog}
        EditDialog={EditDialog}
        DeleteDialog={DeleteDialog}
      >
        {({ deleting, ...handlers }) => (
          <List
            loading={loading || deleting}
            data={data}
            batchActions={batchActions}
            rowActions={rowActions}
            onRefresh={reload}
            onReload={refetch}
            {...handlers}
            {...restProps}
          />
        )}
      </CRUDListContainer>
    )
  }

  ListContainer.displayName = `${name}ListContainer`

  const createStandardListPage = () => {
    const usePrefParams = createUsePrefParamsHook(name, listTablePrefs)
    // ListPage
    return () => {
      const { params, getParamsUpdater } = usePrefParams(defaultParams)
      const [data, loading, reload] = useDataLoader(loaderFn, params)
      return (
        <>
          {!!pollingInterval && (
            <PollingData
              loading={loading}
              onReload={reload}
              refreshDuration={pollingInterval}
              pollingCondition={pollingCondition ? () => pollingCondition(data) : undefined}
              hidden
            />
          )}
          <ListContainer
            getParamsUpdater={getParamsUpdater}
            data={data}
            loading={loading}
            reload={reload}
            {...pick(listTablePrefs, params)}
          />
          {debug && <pre>{JSON.stringify(data, null, 4)}</pre>}
        </>
      )
    }
  }

  const ListPage = options.ListPage ? options.ListPage({ ListContainer }) : createStandardListPage()

  ListPage.displayName = `${name}ListPage`

  return {
    ListPage,
    ListContainer,
    List,
  }
}

export default createCRUDComponents

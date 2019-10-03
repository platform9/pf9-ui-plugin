import React, { useCallback } from 'react'
import CRUDListContainer from 'core/components/CRUDListContainer'
import ListTable from 'core/components/listTable/ListTable'
import TopAddButtonAndDialog from 'core/components/TopAddButtonAndDialog'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import useDataLoader from 'core/hooks/useDataLoader'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { withRouter } from 'react-router-dom'
import { emptyArr } from 'utils/fp'
import { getContextLoader } from 'core/helpers/createContextLoader'
import { getContextUpdater } from 'core/helpers/createContextUpdater'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { pick } from 'ramda'
import { listTablePrefs } from 'app/constants'

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

const createCRUDComponents = options => {
  const {
    // We can either provide the cacheKey to autoresolve the loader, or the loaderFn/deleteFn functions directly
    cacheKey,
    loaderFn = cacheKey ? getContextLoader(cacheKey) : null,
    deleteFn = cacheKey ? getContextUpdater(cacheKey, 'delete') : null,
    defaultParams = {},
    columns = [],
    batchActions = [],
    rowActions = [],
    uniqueIdentifier = 'id',
    addText = 'Add',
    addUrl,
    renderAddDialog,
    editUrl,
    debug,
    name,
  } = options

  // List
  const List = ({
    onAdd, onDelete, onEdit, batchActions, rowActions, data, onRefresh, onActionComplete, loading,
    visibleColumns, columnsOrder, rowsPerPage, orderBy, orderDirection,
    getParamsUpdater, filters,
  }) => {
    // Disabling the "No data found" message for now because there create action is
    // tied to the ListTable and if there are no entities there won't be any way
    // for the user to create new ones.
    // TODO: We need to decouple the Add functionality from the ListTable completely.
    // if (!data || data.length === 0) {
    //   return <h1>No data found.</h1>
    // }
    return (
      <ListTable
        loading={loading}
        onActionComplete={onActionComplete}
        onRefresh={onRefresh}
        columns={columns}
        filters={filters}
        data={data}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        batchActions={batchActions}
        rowActions={rowActions}
        searchTarget="name"
        uniqueIdentifier={uniqueIdentifier}
        visibleColumns={visibleColumns}
        columnsOrder={columnsOrder}
        rowsPerPage={rowsPerPage}
        orderBy={orderBy}
        orderDirection={orderDirection}
        onSortChange={getParamsUpdater('orderBy', 'orderDirection')}
        onRowsPerPageChange={getParamsUpdater('rowsPerPage')}
        onColumnsChange={getParamsUpdater('visibleColumns', 'columnsOrder')}
      />
    )
  }
  List.displayName = `${name}List`

  // ListContainer
  const ListContainer = withRouter(({ history, data, loading, reload, ...restProps }) => {
    const [handleRemove, deleting] = deleteFn ? useDataUpdater(deleteFn, reload) : emptyArr
    const refetch = useCallback(() => reload(true))
    return (
      <CRUDListContainer
        items={data}
        editUrl={editUrl}
        onRemove={handleRemove}
        uniqueIdentifier={uniqueIdentifier}
      >
        {handlers => <>
          <TopAddButtonAndDialog
            addUrl={addUrl}
            addText={addText}
            renderAddDialog={renderAddDialog}
            reload={reload}
          />
          <List
            loading={loading || deleting}
            data={data}
            batchActions={batchActions}
            rowActions={rowActions}
            onRefresh={refetch}
            onActionComplete={reload}
            {...handlers}
            {...restProps}
          />
        </>}
      </CRUDListContainer>
    )
  })

  ListContainer.displayName = `${name}ListContainer`

  const createStandardListPage = () => {
    const usePrefParams = createUsePrefParamsHook(name, listTablePrefs)
    // ListPage
    return () => {
      const { params, getParamsUpdater } = usePrefParams(defaultParams)
      const [data, loading, reload] = useDataLoader(loaderFn, params)
      return <>
        <ListContainer
          getParamsUpdater={getParamsUpdater}
          data={data}
          loading={loading}
          reload={reload}
          {...pick(listTablePrefs, params)}
        />
        {debug && <pre>{JSON.stringify(data, null, 4)}</pre>}
      </>
    }
  }

  const ListPage = requiresAuthentication(options.ListPage
    ? options.ListPage({ ListContainer })
    : createStandardListPage())

  ListPage.displayName = `${name}ListPage`

  return {
    ListPage,
    ListContainer,
    List,
  }
}

export default createCRUDComponents

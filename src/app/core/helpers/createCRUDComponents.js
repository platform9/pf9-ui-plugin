import React, { useMemo, useCallback } from 'react'
import CreateButton from 'core/components/buttons/CreateButton'
import CRUDListContainer from 'core/components/CRUDListContainer'
import ListTable from 'core/components/listTable/ListTable'
import TopExtraContent from 'core/components/TopExtraContent'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import useDataLoader from 'core/hooks/useDataLoader'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { withRouter } from 'react-router-dom'
import { withScopedPreferences } from 'core/providers/PreferencesProvider'
import { emptyArr } from 'utils/fp'
import { getContextLoader } from 'core/helpers/createContextLoader'
import { getContextUpdater } from 'core/helpers/createContextUpdater'

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
    // We can either provide the dataKey to autoresolve the loader, or the loaderFn/deleteFn functions directly
    dataKey,
    loaderFn = dataKey ? getContextLoader(dataKey) : null,
    deleteFn = dataKey ? getContextUpdater(dataKey, 'delete') : null,
    columns = [],
    rowActions = () => [],
    uniqueIdentifier = 'id',
    addText = 'Add',
    addUrl,
    editUrl,
    debug,
    name,
  } = options

  // List
  const List = withScopedPreferences(name)(({
    onAdd, onDelete, onEdit, rowActions, data, onRefresh, loading,
    preferences: { visibleColumns, columnsOrder, rowsPerPage },
    updatePreferences,
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
        onRefresh={onRefresh}
        columns={columns}
        data={data}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        rowActions={rowActions}
        searchTarget="name"
        uniqueIdentifier={uniqueIdentifier}
        visibleColumns={visibleColumns}
        columnsOrder={columnsOrder}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={rowsPerPage => updatePreferences({ rowsPerPage })}
        onColumnsChange={updatePreferences}
      />
    )
  })
  List.displayName = `${name}List`

  // ListContainer
  const ContainerBase = ({ params, setParams, history, data, loading, reload }) => {
    const [handleRemove, deleting] = deleteFn ? useDataUpdater(deleteFn, reload) : emptyArr
    const addButton = useMemo(() =>
      <CreateButton onClick={() => history.push(addUrl)}>{addText}</CreateButton>,
    [history])
    const refetch = useCallback(() => reload(true))

    let moreProps = {}
    if (rowActions && rowActions.length > 0) {
      moreProps.rowActions = rowActions
    }

    return (
      <CRUDListContainer
        items={data}
        params={params}
        setParams={setParams}
        editUrl={editUrl}
        onRemove={handleRemove}
        uniqueIdentifier={uniqueIdentifier}
      >
        {handlers => <>
          {addUrl && <TopExtraContent>{addButton}</TopExtraContent>}
          <List loading={loading || deleting} data={data} onRefresh={refetch} {...handlers} {...moreProps} />
        </>}
      </CRUDListContainer>
    )
  }

  const ListContainer = withRouter(ContainerBase)

  ListContainer.displayName = `${name}ListContainer`

  const createStandardListPage = () => {
    // ListPage
    return () => {
      const [data, loading, reload] = useDataLoader(loaderFn)
      return <>
        <ListContainer data={data} loading={loading} reload={reload} />
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

import React from 'react'
import DataLoader from 'core/DataLoader'
import CRUDListContainer from 'core/components/CRUDListContainer'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import ListTable from 'core/components/listTable/ListTable'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { compose } from 'core/../../utils/fp'
import { withAppContext } from 'core/AppContext'
import { withRouter } from 'react-router-dom'
import { withScopedPreferences } from 'core/PreferencesProvider'

/**
 * This helper removes a lot of boilerplate from standard CRUD operations.
 *
 * We separate them out into the following components:
 *   - ListPage:
 *       Responsible for fetching the data.
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
  const defaults = {
    columns: [],
    rowActions: () => [],
    uniqueIdentifier: 'id',
  }

  const {
    actions,
    baseUrl,
    columns,
    dataKey,
    debug,
    deleteFn,
    loaderFn,
    name,
    rowActions,
    title,
    uniqueIdentifier,
  } = { ...defaults, ...options }

  const crudActions = actions ? createCRUDActions(actions) : null

  // List
  const List = withScopedPreferences(name)(({
    onAdd, onDelete, onEdit, rowActions, data,
    preferences: { visibleColumns, columnsOrder, rowsPerPage },
    updatePreferences
  }) => {
    if (!data || data.length === 0) {
      return <h1>No data found.</h1>
    }
    return (
      <ListTable
        title={title}
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
  class ContainerBase extends React.Component {
    handleRemove = id => {
      const { context, setContext } = this.props
      return (deleteFn || crudActions.delete)({ id, context, setContext })
    }

    render () {
      let moreProps = {}
      if (rowActions && rowActions.length > 0) {
        moreProps.rowActions = rowActions
      }

      return (
        <CRUDListContainer
          items={this.props.data}
          addUrl={`${baseUrl}/add`}
          editUrl={`${baseUrl}/edit`}
          onRemove={this.handleRemove}
          uniqueIdentifier={uniqueIdentifier}
        >
          {handlers => <List data={this.props.data} {...handlers} {...moreProps} />}
        </CRUDListContainer>
      )
    }
  }

  const ListContainer = compose(
    withAppContext,
    withRouter,
  )(ContainerBase)

  ListContainer.displayName = `${name}ListContainer`

  // ListPage
  const StandardListPage = () => (
    <DataLoader dataKey={dataKey} loaderFn={loaderFn || crudActions.list}>
      {({ data }) =>
        <React.Fragment>
          <ListContainer data={data} />
          {debug && <pre>{JSON.stringify(data, null, 4)}</pre>}
        </React.Fragment>
      }
    </DataLoader>
  )
  const ListPage = requiresAuthentication(options.ListPage || StandardListPage)
  ListPage.displayName = `${name}ListPage`

  return {
    ListPage,
    ListContainer,
    List,
  }
}

export default createCRUDComponents

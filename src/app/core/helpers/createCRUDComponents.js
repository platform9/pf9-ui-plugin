import React from 'react'
import CreateButton from 'core/components/buttons/CreateButton'
import CRUDListContainer from 'core/components/CRUDListContainer'
import ListTable from 'core/components/listTable/ListTable'
import TopExtraContent from 'core/components/TopExtraContent'
import createCRUDActions from 'core/helpers/createCRUDActions'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import withDataLoader from 'core/hocs/withDataLoader'
import withDataMapper from 'core/hocs/withDataMapper'
import { compose } from 'app/utils/fp'
import { pathOr, prop } from 'ramda'
import { withAppContext } from 'core/AppContext'
import { withRouter } from 'react-router-dom'
import { withScopedPreferences } from 'core/providers/PreferencesProvider'
import { withToast } from 'core/providers/ToastProvider'

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
    actions,
    crudActions = actions ? createCRUDActions(actions) : null,
    dataKey,
    deleteFn,
    loaderFn,
    mappers = { [dataKey]: pathOr([], ['context', dataKey]) },
    loaders = loaderFn || crudActions ? { [dataKey]: loaderFn || prop('list', crudActions) } : null,
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
    onAdd, onDelete, onEdit, rowActions, data,
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
    handleRemove = async id => {
      return (deleteFn || crudActions.delete)({ id, ...this.props })
    }

    redirectToAdd = () => {
      this.props.history.push(addUrl)
    }

    renderAddButton = () => <CreateButton onClick={this.redirectToAdd}>{addText}</CreateButton>

    render () {
      let moreProps = {}
      if (rowActions && rowActions.length > 0) {
        moreProps.rowActions = rowActions
      }

      return (
        <CRUDListContainer
          items={this.props.data}
          editUrl={editUrl}
          onRemove={this.handleRemove}
          uniqueIdentifier={uniqueIdentifier}
        >
          {handlers => <React.Fragment>
            {addUrl && <TopExtraContent>{this.renderAddButton()}</TopExtraContent>}
            <List data={this.props.data} {...handlers} {...moreProps} />
          </React.Fragment>}
        </CRUDListContainer>
      )
    }
  }

  const ListContainer = compose(
    withToast,
    withAppContext,
    withRouter,
  )(ContainerBase)

  ListContainer.displayName = `${name}ListContainer`

  const createStandardListPage = () => {
    // ListPage
    let StandardListPage = ({ data }) => (
      <React.Fragment>
        <ListContainer data={data[dataKey]} />
        {debug && <pre>{JSON.stringify(data[dataKey], null, 4)}</pre>}
      </React.Fragment>
    )

    if (loaders) {
      if (mappers) {
        StandardListPage = withDataMapper(mappers)(StandardListPage)
      }
      StandardListPage = withDataLoader(loaders)(StandardListPage)
    }
    return StandardListPage
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

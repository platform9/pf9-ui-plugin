import React from 'react'
import DataLoader from 'core/DataLoader'
import CRUDListContainer from 'core/common/CRUDListContainer'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import ListTable from 'core/common/ListTable'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'
import { withRouter } from 'react-router-dom'

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
    baseUrl,
    columns,
    dataKey,
    deleteFn,
    loaderFn,
    name,
    title,
    uniqueIdentifier,
  } = { ...defaults, ...options }

  // List
  const List = ({ onAdd, onDelete, onEdit, rowActions, data }) => {
    if (!data || data.length === 0) {
      return <h1>No clusters found.</h1>
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
      />
    )
  }
  List.displayName = `${name}List`

  // ListContainer
  class ContainerBase extends React.Component {
    handleRemove = id => {
      const { context, setContext } = this.props
      return deleteFn({ id, context, setContext })
    }

    render () {
      const rowActions = options.rowActions()

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
  const ListPage = requiresAuthentication(() =>
    <DataLoader dataKey={dataKey} loaderFn={loaderFn}>
      {({ data }) => <ListContainer data={data} />}
    </DataLoader>
  )
  ListPage.displayName = `${name}ListPage`

  return {
    ListPage,
    ListContainer,
    List,
  }
}

export default createCRUDComponents

import React from 'react'
import PropTypes from 'prop-types'

import { withApollo } from 'react-apollo'
import CRUDListContainer from 'core/common/CRUDListContainer'

import RoutersList from './RoutersList'
import { GET_ROUTERS, REMOVE_ROUTER } from './actions'

class RoutersListContainer extends React.Component {
  handleRemove = async id => {
    const { client } = this.props
    client.mutate({
      mutation: REMOVE_ROUTER,
      variables: { id },
      update: cache => {
        const data = cache.readQuery({ query: GET_ROUTERS })
        data.routers = data.routers.filter(x => x.id !== id)
        cache.writeQuery({ query: GET_ROUTERS, data })
      }
    })
  }

  render () {
    return (
      <CRUDListContainer
        items={this.props.routers}
        onRemove={this.handleRemove}
        addUrl="/ui/openstack/routers/add"
        editUrl="/ui/openstack/routers/edit"
      >
        {({ onDelete, onAdd, onEdit }) => (
          <RoutersList
            routers={this.props.routers}
            onAdd={onAdd}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </CRUDListContainer>
    )
  }
}

RoutersListContainer.propTypes = {
  routers: PropTypes.arrayOf(PropTypes.object)
}

export default withApollo(RoutersListContainer)

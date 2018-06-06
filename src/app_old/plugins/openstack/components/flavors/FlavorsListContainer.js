import React from 'react'
import PropTypes from 'prop-types'

import { withApollo } from 'react-apollo'
import CRUDListContainer from 'core/common/CRUDListContainer'

import FlavorsList from './FlavorsList'
import { GET_FLAVORS, REMOVE_FLAVOR } from './actions'

class FlavorsListContainer extends React.Component {
  handleRemove = async id => {
    const { client } = this.props
    client.mutate({
      mutation: REMOVE_FLAVOR,
      variables: { id },
      update: cache => {
        const data = cache.readQuery({ query: GET_FLAVORS })
        data.flavors = data.flavors.filter(x => x.id !== id)
        cache.writeQuery({ query: GET_FLAVORS, data })
      }
    })
  }

  render () {
    return (
      <CRUDListContainer
        items={this.props.flavors}
        onRemove={this.handleRemove}
        addUrl="/ui/openstack/flavors/add"
      >
        {({ onDelete, onAdd }) => (
          <FlavorsList
            flavors={this.props.flavors}
            onAdd={onAdd}
            onDelete={onDelete}
          />
        )}
      </CRUDListContainer>
    )
  }
}

FlavorsListContainer.propTypes = {
  flavors: PropTypes.arrayOf(PropTypes.object)
}
export default withApollo(FlavorsListContainer)

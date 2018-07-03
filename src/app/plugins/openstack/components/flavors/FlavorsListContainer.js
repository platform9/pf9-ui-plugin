import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import FlavorsList from './FlavorsList'
import { GET_FLAVORS, REMOVE_FLAVOR } from './actions'

class FlavorsListContainer extends React.Component {
  render () {
    return (
      <CRUDListContainer
        items={this.props.flavors}
        objType="flavors"
        getQuery={GET_FLAVORS}
        removeQuery={REMOVE_FLAVOR}
        addUrl="/ui/openstack/flavors/add"
        editUrl="/ui/openstack/flavors/edit"
      >
        {({ onDelete, onAdd, onEdit }) => (
          <FlavorsList
            flavors={this.props.flavors}
            onAdd={onAdd}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </CRUDListContainer>
    )
  }
}

FlavorsListContainer.propTypes = {
  flavors: PropTypes.arrayOf(PropTypes.object)
}
export default FlavorsListContainer

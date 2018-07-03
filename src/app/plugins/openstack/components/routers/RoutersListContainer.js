import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import RoutersList from './RoutersList'
import { GET_ROUTERS, REMOVE_ROUTER } from './actions'

class RoutersListContainer extends React.Component {
  render () {
    return (
      <CRUDListContainer
        items={this.props.routers}
        objType="routers"
        getQuery={GET_ROUTERS}
        removeQuery={REMOVE_ROUTER}
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

export default RoutersListContainer

/* eslint-disable camelcase */
import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import InstancesList from './InstancesList'

class InstancesListContainer extends React.Component {
  render () {
    const instances = this.props.instances || []
    return (
      <CRUDListContainer
        items={instances}
        addUrl="/ui/openstack/instances/add"
        editUrl="/ui/openstack/instances/edit"
      >
        {({ onDelete, onAdd, onEdit }) => (
          <InstancesList
            instances={instances}
            onAdd={onAdd}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </CRUDListContainer>
    )
  }
}

InstancesListContainer.propTypes = {
  instances: PropTypes.arrayOf(PropTypes.object)
}

export default InstancesListContainer

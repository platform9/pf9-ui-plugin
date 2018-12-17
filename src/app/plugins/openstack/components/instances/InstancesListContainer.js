/* eslint-disable camelcase */
import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import createListTableComponent from 'core/helpers/createListTableComponent'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status' },
  { id: 'state', label: 'State' }
]

export const InstancesList = createListTableComponent({
  title: 'Instances',
  emptyText: 'No instances found',
  name: 'InstancesList',
  columns,
})

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
            data={instances}
            onAdd={onAdd}
            onDelete={onDelete}
            onEdit={onEdit} />
        )}
      </CRUDListContainer>
    )
  }
}

InstancesListContainer.propTypes = {
  instances: PropTypes.arrayOf(PropTypes.object)
}

export default InstancesListContainer

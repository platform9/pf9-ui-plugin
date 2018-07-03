import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import VolumesList from './VolumesList'
import { GET_VOLUMES, REMOVE_VOLUME } from './actions'

class VolumesListContainer extends React.Component {
  render () {
    return (
      <CRUDListContainer
        items={this.props.volumes}
        objType="volumes"
        getQuery={GET_VOLUMES}
        removeQuery={REMOVE_VOLUME}
        addUrl="/ui/openstack/volumes/add"
        editUrl="/ui/openstack/volumes/edit"
      >
        {({ onDelete, onAdd, onEdit }) => (
          <VolumesList
            volumes={this.props.volumes}
            onAdd={onAdd}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </CRUDListContainer>
    )
  }
}

VolumesListContainer.propTypes = {
  volumes: PropTypes.arrayOf(PropTypes.object)
}

export default VolumesListContainer

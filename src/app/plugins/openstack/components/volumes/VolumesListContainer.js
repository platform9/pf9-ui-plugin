import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import VolumesList from './VolumesList'

class VolumesListContainer extends React.Component {
  render () {
    return (
      <CRUDListContainer
        items={this.props.volumes}
        addUrl="/ui/openstack/storage/volumes/add"
        editUrl="/ui/openstack/storage/volumes/edit"
      >
        {handlers => <VolumesList volumes={this.props.volumes} {...handlers} />}
      </CRUDListContainer>
    )
  }
}

VolumesListContainer.propTypes = {
  volumes: PropTypes.arrayOf(PropTypes.object)
}

export default VolumesListContainer

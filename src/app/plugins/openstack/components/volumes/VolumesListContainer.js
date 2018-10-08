import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import VolumesList from './VolumesList'
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'
import { withRouter } from 'react-router'

class VolumesListContainer extends React.Component {
  handleRemove = async id => {
    const { context, setContext } = this.props
    await context.apiClient.cinder.deleteVolume(id)
    const newVolumes = context.volumes.filter(x => x.id !== id)
    setContext({ volumes: newVolumes })
  }

  handleSnapshot = async volume => {
    this.props.history.push(`/ui/openstack/storage/volumes/snapshot/${volume.id}`)
  }

  render () {
    const rowActions = [
      { icon: <PhotoCameraIcon />, label: 'Snapshot', action: this.handleSnapshot }
    ]

    return (
      <CRUDListContainer
        items={this.props.volumes}
        addUrl="/ui/openstack/storage/volumes/add"
        editUrl="/ui/openstack/storage/volumes/edit"
        onRemove={this.handleRemove}
      >
        {handlers => <VolumesList volumes={this.props.volumes} {...handlers} rowActions={rowActions} />}
      </CRUDListContainer>
    )
  }
}

VolumesListContainer.propTypes = {
  volumes: PropTypes.arrayOf(PropTypes.object)
}

export default compose(
  withAppContext,
  withRouter,
)(VolumesListContainer)

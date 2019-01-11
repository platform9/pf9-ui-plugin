import React from 'react'
import PropTypes from 'prop-types'
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppContext'
import CRUDListContainer from 'core/components/CRUDListContainer'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { withRouter } from 'react-router'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'volume_type', label: 'Volume Type' },
  { id: 'description', label: 'Description' },
  { id: 'status', label: 'Status' },
  { id: 'tenant', label: 'Tenant' },
  { id: 'source', label: 'Source' },
  { id: 'host', label: 'Host' },
  { id: 'instance', label: 'Instance' },
  { id: 'device', label: 'Device' },
  { id: 'size', label: 'Capacity' },
  { id: 'bootable', label: 'Bootable' },
  { id: 'created_at', label: 'Created' },
  { id: 'id', label: 'OpenStack ID' },
  { id: 'attachedMode', label: 'attached_mode' },
  { id: 'readonly', label: 'readonly' },

  // TODO: We probably want to write a metadata renderer for this kind of format
  // since we use it in a few places for tags / metadata.
  { id: 'metadata', label: 'Metadata', render: data => JSON.stringify(data) }
]

export const VolumesList = createListTableComponent({
  title: 'Volume',
  emptyText: 'No volumes found.',
  name: 'VolumesList',
  columns,
})

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
        {handlers => <VolumesList data={this.props.volumes} {...handlers} rowActions={rowActions} />}
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

import React from 'react'
import PropTypes from 'prop-types'
import useReactRouter from 'use-react-router'
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera'
import CRUDListContainer from 'core/components/CRUDListContainer'
import createListTableComponent from 'core/helpers/createListTableComponent'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { volumeActions } from 'openstack/components/volumes/actions'

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
  { id: 'metadata', label: 'Metadata', render: data => JSON.stringify(data) },
]

export const VolumesList = createListTableComponent({
  title: 'Volume',
  emptyText: 'No volumes found.',
  name: 'VolumesList',
  columns,
})

const VolumesListContainer = ({ volumes }) => {
  const { history } = useReactRouter()
  const [remove, removing] = useDataUpdater(volumeActions.delete)
  const handleRemove = async id => {
    remove({ id })
  }
  const handleSnapshot = volume => {
    history.push(`/ui/openstack/storage/volumes/snapshot/${volume.id}`)
  }
  const rowActions = [
    { icon: <PhotoCameraIcon />, label: 'Snapshot', action: handleSnapshot },
  ]

  return (
    <CRUDListContainer
      items={volumes}
      addUrl="/ui/openstack/storage/volumes/add"
      editUrl="/ui/openstack/storage/volumes/edit"
      onRemove={handleRemove}
    >
      {handlers =>
        <VolumesList loading={removing} data={volumes} {...handlers} rowActions={rowActions} />}
    </CRUDListContainer>
  )
}

VolumesListContainer.propTypes = {
  volumes: PropTypes.arrayOf(PropTypes.object),
}

export default VolumesListContainer

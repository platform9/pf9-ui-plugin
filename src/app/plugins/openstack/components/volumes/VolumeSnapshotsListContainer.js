import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/components/CRUDListContainer'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { volumeSnapshotActions } from 'openstack/components/volumes/actions'
import useDataUpdater from 'core/hooks/useDataUpdater'

export const columns = [
  { id: 'id', label: 'OpenStack ID' },
  { id: 'name', label: 'Name' },
  { id: 'description', label: 'Description' },
  { id: 'status', label: 'Status' },
  { id: 'source', label: 'Source' },
  { id: 'size', label: 'Capacity' },
  { id: 'created_at', label: 'Created' },
  { id: 'tenant', label: 'Tenant' },
]

export const VolumeSnapshotsList = createListTableComponent({
  title: 'Volume Snapshots',
  emptyText: 'No volume snapshots found.',
  name: 'VolumeTypesList',
  columns,
})

const VolumeSnapshotsListContainer = ({ volumeSnapshots }) => {
  const [remove, removing] = useDataUpdater(volumeSnapshotActions.delete)
  const handleRemove = async id => {
    remove({ id })
  }

  return (
    <CRUDListContainer
      items={volumeSnapshots}
      editUrl="/ui/openstack/storage/volumeSnapshots/edit"
      onRemove={handleRemove}
    >
      {handlers => <VolumeSnapshotsList loading={removing} data={volumeSnapshots} {...handlers} />}
    </CRUDListContainer>
  )
}

VolumeSnapshotsListContainer.propTypes = {
  volumeSnapshots: PropTypes.arrayOf(PropTypes.object),
}

export default VolumeSnapshotsListContainer

import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'
import createListTableComponent from 'core/helpers/createListTableComponent'

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

class VolumeSnapshotsListContainer extends React.Component {
  handleRemove = async id => {
    const { context, setContext } = this.props
    await context.apiClient.cinder.deleteSnapshot(id)
    const newVolumeSnapshots = context.volumeSnapshots.filter(x => x.id !== id)
    setContext({ volumeSnapshots: newVolumeSnapshots })
  }

  render () {
    const { volumeSnapshots } = this.props
    return (
      <CRUDListContainer
        items={volumeSnapshots}
        editUrl="/ui/openstack/storage/volumeSnapshots/edit"
        onRemove={this.handleRemove}
      >
        {handlers => <VolumeSnapshotsList data={volumeSnapshots} {...handlers} />}
      </CRUDListContainer>
    )
  }
}

VolumeSnapshotsListContainer.propTypes = {
  volumeSnapshots: PropTypes.arrayOf(PropTypes.object)
}

export default compose(
  withAppContext,
)(VolumeSnapshotsListContainer)

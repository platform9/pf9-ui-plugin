import React from 'react'
import PropTypes from 'prop-types'
import ApiClient from 'api-client/ApiClient'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppProvider'
import CRUDListContainer from 'core/components/CRUDListContainer'
import createListTableComponent from 'core/helpers/createListTableComponent'
import { loadVolumeSnapshots } from 'openstack/components/volumes/actions'
import { dataContextKey } from 'core/helpers/createContextLoader'
import { assocPath } from 'ramda'

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
    const { getContext, setContext } = this.props
    // TODO: use createContextUpdater
    await ApiClient.getInstance().cinder.deleteSnapshot(id)
    const newVolumeSnapshots = (await loadVolumeSnapshots({ getContext, setContext }))
      .filter(x => x.id !== id)
    setContext(assocPath([dataContextKey, 'volumeSnapshots'], newVolumeSnapshots))
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
  volumeSnapshots: PropTypes.arrayOf(PropTypes.object),
}

export default compose(
  withAppContext,
)(VolumeSnapshotsListContainer)

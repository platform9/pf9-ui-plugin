import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import VolumeSnapshotsList from './VolumeSnapshotsList'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'

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
        {handlers => <VolumeSnapshotsList volumeSnapshots={volumeSnapshots} {...handlers} />}
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

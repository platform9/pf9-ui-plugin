import React from 'react'
import { withRouter } from 'react-router'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppProvider'
import FormWrapper from 'core/components/FormWrapper'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadVolumeSnapshots } from './actions'
import CreateSnapshotForm from './CreateSnapshotForm'

class CreateSnapshotPage extends React.Component {
  handleAdd = async snapshotData => {
    const { setContext, getContext, history, match } = this.props
    const { volumeId } = match.params
    if (!volumeId) { return console.error('Invalid volumeId') }
    try {
      const params = {
        volume_id: volumeId,
        name: snapshotData.name,
        description: snapshotData.description,
      }
      const existingSnapshots = await loadVolumeSnapshots({ setContext, getContext })
      const createdSnapshot = await getContext().apiClient.cinder.snapshotVolume(params)
      setContext({ volumeSnapshots: [ ...existingSnapshots, createdSnapshot ] })
      history.push('/ui/openstack/storage#volumeSnapshots')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <FormWrapper title="Create Snapshot" backUrl="/ui/openstack/storage#volumes">
        <CreateSnapshotForm onComplete={this.handleAdd} />
      </FormWrapper>
    )
  }
}

export default compose(
  withAppContext,
  withRouter,
  requiresAuthentication
)(CreateSnapshotPage)

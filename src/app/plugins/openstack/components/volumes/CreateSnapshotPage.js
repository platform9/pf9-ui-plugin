import React from 'react'
import CreateSnapshotForm from './CreateSnapshotForm'
import FormWrapper from 'core/common/FormWrapper'
import requiresAuthentication from '../../util/requiresAuthentication'
import { compose } from 'core/fp'
import { loadVolumeSnapshots } from './actions'
import { withAppContext } from 'core/AppContext'
import { withRouter } from 'react-router'

class CreateSnapshotPage extends React.Component {
  handleAdd = async snapshotData => {
    const { setContext, context, history, match } = this.props
    const { volumeId } = match.params
    if (!volumeId) { return console.error('Invalid volumeId') }
    try {
      const params = {
        volume_id: volumeId,
        name: snapshotData.name,
        description: snapshotData.description,
      }
      const existingSnapshots = await loadVolumeSnapshots({ setContext, context })
      const createdSnapshot = await context.openstackClient.cinder.snapshotVolume(params)
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

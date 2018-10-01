import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddVolumeForm from './AddVolumeForm'
import { withRouter } from 'react-router-dom'
import { compose } from 'core/fp'
import requiresAuthentication from '../../util/requiresAuthentication'
import { withAppContext } from 'core/AppContext'
import { loadVolumes } from './actions'

class AddVolumePage extends React.Component {
  handleAdd = async volume => {
    const { setContext, context, history } = this.props
    try {
      const existing = await loadVolumes({ setContext, context })
      const created = await context.openstackClient.cinder.createVolume(volume)
      setContext({ volumes: [ ...existing, created ] })
      history.push('/ui/openstack/storage#volumes')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <FormWrapper title="Add Volume" backUrl="/ui/openstack/storage#volumes">
        <AddVolumeForm onComplete={this.handleAdd} />
      </FormWrapper>
    )
  }
}

export default compose(
  withAppContext,
  withRouter,
  requiresAuthentication
)(AddVolumePage)

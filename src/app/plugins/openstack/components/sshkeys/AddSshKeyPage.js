import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddSshKeyForm from './AddSshKeyForm'
import { withRouter } from 'react-router-dom'
import { compose } from 'core/fp'
import requiresAuthentication from '../../util/requiresAuthentication'
import { withAppContext } from 'core/AppContext'
import { loadSshKeys } from './actions'

class AddSshKeyPage extends React.Component {
  handleAdd = async sshKey => {
    const { setContext, context, history } = this.props
    try {
      const existing = await loadSshKeys({ context, setContext })
      const createdSshKey = await context.openstackClient.nova.createSshKey(sshKey)
      setContext({ sshKeys: [ ...existing, createdSshKey ] })
      history.push('/ui/openstack/sshkeys')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <FormWrapper title="Add SSH Key" backUrl="/ui/openstack/sshkeys">
        <AddSshKeyForm onComplete={this.handleAdd} />
      </FormWrapper>
    )
  }
}

export default compose(
  withAppContext,
  withRouter,
  requiresAuthentication
)(AddSshKeyPage)

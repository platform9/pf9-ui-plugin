import React from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppContext'
import FormWrapper from 'core/components/FormWrapper'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadSshKeys } from './actions'
import AddSshKeyForm from './AddSshKeyForm'

class AddSshKeyPage extends React.Component {
  handleAdd = async sshKey => {
    const { setContext, context, history } = this.props
    try {
      const existing = await loadSshKeys({ context, setContext })
      const createdSshKey = await context.apiClient.nova.createSshKey(sshKey)
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

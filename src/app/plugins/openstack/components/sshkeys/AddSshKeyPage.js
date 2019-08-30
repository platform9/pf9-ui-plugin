import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppProvider'
import FormWrapper from 'core/components/FormWrapper'
import requiresAuthentication from '../../util/requiresAuthentication'
import sshKeyActions from './actions'
import AddSshKeyForm from './AddSshKeyForm'

class AddSshKeyPage extends PureComponent {
  handleAdd = async sshKey => {
    const { setContext, getContext, history } = this.props
    await sshKeyActions.create({ getContext, setContext, params: sshKey })
    history.push('/ui/openstack/sshkeys')
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

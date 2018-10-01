import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddFlavorForm from './AddFlavorForm'
import { withRouter } from 'react-router-dom'
import { compose } from 'core/fp'
import requiresAuthentication from '../../util/requiresAuthentication'
import { withAppContext } from 'core/AppContext'
import { loadFlavors } from './actions'

class AddFlavorPage extends React.Component {
  handleAdd = async flavor => {
    const { setContext, context, history } = this.props
    try {
      const existing = await loadFlavors({ setContext, context })
      const createdFlavor = await context.openstackClient.nova.createFlavor(flavor)
      setContext({ flavors: [ ...existing, createdFlavor ] })
      history.push('/ui/openstack/flavors')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <FormWrapper title="Add Flavor" backUrl="/ui/openstack/flavors">
        <AddFlavorForm onComplete={this.handleAdd} />
      </FormWrapper>
    )
  }
}

export default compose(
  withAppContext,
  withRouter,
  requiresAuthentication
)(AddFlavorPage)

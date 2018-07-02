import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import UpdateFlavorForm from './UpdateFlavorForm'
import { GET_FLAVOR } from './actions'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateFlavorPage extends React.Component {
  componentDidMount () {
    const { client } = this.props
    const flavorId = this.props.match.params.flavorId

    client.query({
      query: GET_FLAVOR,
      variables: {
        id: flavorId
      }
    }).then((response) => {
      const flavor = response.data.flavor
      if (flavor) {
        this.setState({ flavor })
      }
    })
  }

  render () {
    const flavor = this.state && this.state.flavor

    return (
      <FormWrapper title="Update Flave" backUrl="/ui/openstack/flavors">
        { flavor &&
          <UpdateFlavorForm
            flavor={flavor}
            client={this.props.client}
            history={this.props.history}
            workId={this.props.match.params.flavorId}
          />
        }
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo
)(UpdateFlavorPage)

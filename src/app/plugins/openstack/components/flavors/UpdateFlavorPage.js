import React from 'react'
import { withRouter } from 'react-router-dom'
import UpdateFlavorForm from './UpdateFlavorForm'
import { GET_FLAVOR, UPDATE_FLAVOR } from './actions'
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

  handleSubmit = flavor => {
    const { client, history } = this.props
    const flavorId = this.props.match.params.flavorId

    try {
      client.mutate({
        mutation: UPDATE_FLAVOR,
        variables: {
          id: flavorId,
          input: flavor
        }
      })
      history.push('/ui/openstack/flavors')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const flavor = this.state && this.state.flavor

    return (
      <div>
        <h1>Update Flavor</h1>
        { flavor &&
          <UpdateFlavorForm onSubmit={this.handleSubmit} flavor={flavor} />
        }
      </div>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo
)(UpdateFlavorPage)

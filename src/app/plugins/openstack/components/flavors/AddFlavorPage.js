import React from 'react'
import { withRouter } from 'react-router-dom'
import AddFlavorForm from './AddFlavorForm'
import { ADD_FLAVOR, GET_FLAVORS } from './actions'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddFlavorPage extends React.Component {
  handleSubmit = flavor => {
    const { client, history } = this.props
    try {
      client.mutate({
        mutation: ADD_FLAVOR,
        variables: {
          input: flavor
        },
        update: (proxy, { data: { createFlavor } }) => {
          const data = proxy.readQuery({ query: GET_FLAVORS })
          data.flavors.push(createFlavor)
          proxy.writeQuery({ query: GET_FLAVORS, data })
        }
      })
      history.push('/ui/openstack/flavors')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <div>
        <h1>Add Flavor</h1>
        <AddFlavorForm onSubmit={this.handleSubmit} />
      </div>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo,
)(AddFlavorPage)

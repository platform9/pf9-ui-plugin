import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import AddRouterForm from './AddRouterForm'
import { ADD_ROUTER, GET_ROUTERS } from './actions'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddRouterPage extends React.Component {
  handleSubmit = router => {
    const { client, history } = this.props
    try {
      client.mutate({
        mutation: ADD_ROUTER,
        variables: {
          input: router
        },
        update: (proxy, { data: { createRouter } }) => {
          const data = proxy.readQuery({ query: GET_ROUTERS })
          data.routers.push(createRouter)
          proxy.writeQuery({ query: GET_ROUTERS, data })
        }
      })
      history.push('/ui/openstack/routers')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <FormWrapper title="Add Router" backUrl="/ui/openstack/routers">
        <AddRouterForm onSubmit={this.handleSubmit} />
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo,
)(AddRouterPage)

import React from 'react'
import { withRouter } from 'react-router-dom'
import { compose, withApollo } from 'react-apollo'
import { GET_ROUTER, UPDATE_ROUTER } from './actions'
import FormWrapper from 'core/common/FormWrapper'
import UpdateRouterForm from './UpdateRouterForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateRouterPage extends React.Component {
  componentDidMount () {
    const { client } = this.props
    const routerId = this.props.match.params.routerId

    client.query({
      query: GET_ROUTER,
      variables: {
        id: routerId
      }
    }).then((response) => {
      const router = response.data.router
      if (router) {
        this.setState({ router })
      }
    })
  }

  handleSubmit = router => {
    const { client, history } = this.props
    const routerId = this.props.match.params.routerId

    try {
      client.mutate({
        mutation: UPDATE_ROUTER,
        variables: {
          id: routerId,
          input: router
        }
      })
      history.push('/ui/openstack/routers')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const router = this.state && this.state.router

    return (
      <FormWrapper title="Update Router" backUrl="/ui/openstack/routers">
        {router &&
          <UpdateRouterForm onSubmit={this.handleSubmit} router={router} />
        }
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo
)(UpdateRouterPage)

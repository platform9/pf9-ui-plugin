import React from 'react'
import { withRouter } from 'react-router-dom'
import UpdateGlanceImageForm from './UpdateGlanceImageForm'
import { GET_GLANCEIMAGE, UPDATE_GLANCEIMAGE } from './actions'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateGlanceImagePage extends React.Component {
  componentDidMount () {
    const { client } = this.props
    const glanceImageId = this.props.match.params.glanceImageId

    client.query({
      query: GET_GLANCEIMAGE,
      variables: {
        id: glanceImageId
      }
    }).then((response) => {
      const glanceImage = response.data.glanceImage
      if (glanceImage) {
        this.setState({ glanceImage })
      }
    })
  }

  handleSubmit = glanceImage => {
    const { client, history } = this.props
    const glanceImageId = this.props.match.params.glanceImageId

    try {
      client.mutate({
        mutation: UPDATE_GLANCEIMAGE,
        variables: {
          id: glanceImageId,
          input: glanceImage
        }
      })
      history.push('/ui/openstack/glanceimages')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const glanceImage = this.state && this.state.glanceImage

    return (
      <div>
        <h1>Update Glance Image</h1>
        { glanceImage &&
          <UpdateGlanceImageForm onSubmit={this.handleSubmit} glanceImage={glanceImage} />
        }
      </div>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo
)(UpdateGlanceImagePage)

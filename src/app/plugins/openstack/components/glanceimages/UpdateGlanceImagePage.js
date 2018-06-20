import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
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
      <FormWrapper title="Update Glance Image" backUrl="/ui/openstack/glanceimages">
        { glanceImage &&
          <UpdateGlanceImageForm onSubmit={this.handleSubmit} glanceImage={glanceImage} />
        }
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo
)(UpdateGlanceImagePage)

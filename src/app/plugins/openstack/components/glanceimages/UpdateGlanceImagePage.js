import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import UpdateGlanceImageForm from './UpdateGlanceImageForm'
import { GET_GLANCEIMAGE } from './actions'
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

  render () {
    const glanceImage = this.state && this.state.glanceImage

    return (
      <FormWrapper title="Update Glance Image" backUrl="/ui/openstack/glanceimages">
        { glanceImage &&
          <UpdateGlanceImageForm
            glanceImage={glanceImage}
            client={this.props.client}
            history={this.props.history}
            workId={this.props.match.params.glanceImageId}
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
)(UpdateGlanceImagePage)

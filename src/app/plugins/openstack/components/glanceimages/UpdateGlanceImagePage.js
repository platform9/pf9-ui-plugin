import React from 'react'
import { Query } from 'react-apollo'
import FormWrapper from 'core/common/FormWrapper'
import UpdateGlanceImageForm from './UpdateGlanceImageForm'
import { GET_GLANCEIMAGE } from './actions'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateGlanceImagePage extends React.Component {
  render () {
    const id = this.props.match.params.glanceImageId

    return (
      <Query query={GET_GLANCEIMAGE} variables={{ id }}>
        {({ data }) =>
          <FormWrapper title="Update Glance Image" backUrl="/ui/openstack/glanceimages">
            { data && data.glanceImage &&
              <UpdateGlanceImageForm
                glanceImage={data.glanceImage}
                objId={id}
              />
            }
          </FormWrapper>
        }
      </Query>
    )
  }
}

export default requiresAuthentication(UpdateGlanceImagePage)

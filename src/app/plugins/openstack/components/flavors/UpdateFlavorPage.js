import React from 'react'
import { Query } from 'react-apollo'
import FormWrapper from 'core/common/FormWrapper'
import UpdateFlavorForm from './UpdateFlavorForm'
import { GET_FLAVOR } from './actions'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateFlavorPage extends React.Component {
  render () {
    const id = this.props.match.params.flavorId

    return (
      <Query query={GET_FLAVOR} variables={{ id }}>
        {({ data }) =>
          <FormWrapper title="Update Flave" backUrl="/ui/openstack/flavors">
            { data && data.flavor &&
              <UpdateFlavorForm
                flavor={data.flavor}
                objId={id}
              />
            }
          </FormWrapper>
        }
      </Query>
    )
  }
}

export default requiresAuthentication(UpdateFlavorPage)

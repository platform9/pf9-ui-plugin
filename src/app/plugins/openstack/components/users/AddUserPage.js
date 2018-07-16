import React from 'react'
import { compose, graphql } from 'react-apollo'
import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import FormWrapper from 'core/common/FormWrapper'
import AddUserForm from './AddUserForm'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_TENANTS } from '../tenants/actions'

class AddUserPage extends React.Component {
  render () {
    const { data, loading, error } = this.props
    return (
      <div>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {data.tenants &&
          <FormWrapper title="Add User" backUrl="/ui/openstack/users">
            <AddUserForm tenants={data.tenants} />
          </FormWrapper>
        }
      </div>
    )
  }
}

export default compose(
  requiresAuthentication,
  graphql(GET_TENANTS)
)(AddUserPage)

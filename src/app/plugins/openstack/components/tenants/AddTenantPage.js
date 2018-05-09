import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { addTenant } from '../../actions/tenants'
import AddTenantForm from './AddTenantForm'

const mapStateToProps = state => ({})

@withRouter
@connect(mapStateToProps)
class AddTenantPage extends React.Component {
  handleSubmit = tenant => {
    const { dispatch, history } = this.props
    try {
      dispatch(addTenant(tenant))
      history.push('/ui/openstack/tenants')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <div>
        <h1>Add Users Page</h1>
        <AddTenantForm onSubmit={this.handleSubmit} />
      </div>
    )
  }
}

export default AddTenantPage

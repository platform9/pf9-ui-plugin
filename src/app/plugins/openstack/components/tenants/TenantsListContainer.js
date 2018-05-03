/* eslint-disable react/prop-types */
import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import ConfirmationDialog from 'core/common/ConfirmationDialog'
import TenantsList from './TenantsList'

import { removeProject } from '../../actions/tenants'

const mapStateToProps = state => {
  const { tenants } = state.openstack
  return {
    tenants: tenants.tenants,
  }
}

@withRouter
@connect(mapStateToProps)
class TenantsListContainer extends React.Component {
  state = {
    showConfirmation: false,
    tenantsToDelete: null,
  }

  redirectToAdd = () => {
    this.props.history.push('/ui/openstack/tenants/add')
  }

  handleDelete = selectedIds => {
    this.setState({ showConfirmation: true })
    const selectedTenants = this.props.tenants.filter(tenant => selectedIds.includes(tenant.id))
    this.setState({ tenantsToDelete: selectedTenants })
  }

  handleDeleteCancel = () => {
    this.setState({ showConfirmation: false })
  }

  handleDeleteConfirm = () => {
    this.setState({ showConfirmation: false })
    const tenants = this.state.tenantsToDelete || []
    tenants.forEach(tenant => this.props.dispatch(removeProject(tenant.id)))
  }

  deleteConfirmText = () => {
    const { tenantsToDelete } = this.state
    if (!tenantsToDelete) {
      return
    }
    const tenantNames = tenantsToDelete.map(x => x.name).join(', ')
    return `This will permanently delete the following tenants(s): ${tenantNames}`
  }

  render () {
    const { tenants } = this.props

    return (
      <div>
        <ConfirmationDialog
          open={this.state.showConfirmation}
          text={this.deleteConfirmText()}
          onCancel={this.handleDeleteCancel}
          onConfirm={this.handleDeleteConfirm}
        />

        <TenantsList
          tenants={tenants}
          onAdd={this.redirectToAdd}
          onDelete={this.handleDelete}
        />
      </div>
    )
  }
}

export default TenantsListContainer

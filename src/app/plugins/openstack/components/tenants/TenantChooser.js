import React from 'react'
import Selector from 'core/common/Selector'
import { compose } from 'core/fp'
import { loadTenants } from './actions'
import { withAppContext } from 'core/AppContext'

class TenantChooser extends React.Component {
  state = {
    tenantSearch: '',
    currentTenantName: '',
    tenants: null
  }

  handleChange = key => value => {
    this.setState({
      [key]: value
    })
  }

  updateCurrentTenant = tenantName => {
    const { context, setContext } = this.props
    const { tenants } = this.state

    this.setState({ currentTenantName: tenantName })
    const tenant = tenants.find(x => x.name === tenantName)
    if (!tenant) { return }
    setContext({ currentTenant: tenant })

    const { keystone } = context.openstackClient
    keystone.changeProjectScope(tenant.id)
  }

  handleChoose = tenantName => {
    const { setUserPreference } = this.props
    setUserPreference('lastTenant', tenantName)
    this.updateCurrentTenant(tenantName)
  }

  loadTenants = async (reload = false) => {
    const { context, setContext } = this.props
    const tenants = await loadTenants({ context, setContext, reload })
    this.setState({ tenants })
    return tenants
  }

  tenantNames = tenants => {
    const isUserTenant = x => x.description !== 'Heat stack user project'
    return (tenants || []).filter(isUserTenant).map(x => x.name)
  }

  async componentDidMount () {
    const lastTenant = this.props.getUserPreference('lastTenant')
    const tenants = await this.loadTenants()
    if (!tenants) { return }
    this.setState({ tenants }, () => this.updateCurrentTenant(lastTenant))
  }

  render () {
    const { currentTenantName, tenantSearch, tenants } = this.state

    if (!tenants) { return null }

    return (
      <Selector
        name={currentTenantName || 'service'}
        list={this.tenantNames(tenants)}
        onChoose={this.handleChoose}
        onSearchChange={this.handleChange('tenantSearch')}
        searchTerm={tenantSearch}
      />
    )
  }
}

export default compose(
  withAppContext,
)(TenantChooser)

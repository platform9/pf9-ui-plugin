import React from 'react'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppContext'
import Selector from 'core/components/Selector'
import { withScopedPreferences } from 'core/providers/PreferencesProvider'
import moize from 'moize'
import { assoc } from 'ramda'
import { loadUserTenants } from './actions'

class TenantChooser extends React.Component {
  state = {
    tenantSearch: '',
    currentTenantName: '',
    tenants: null
  }

  handleChange = moize(key => value => {
    this.setState({
      [key]: value
    })
  })

  resetTenantScopedContext = (tenant) => {
    const { setContext } = this.props
    // Clear any data that should change when the user changes tenant.
    // The data will then be reloaded when it is needed.
    setContext({
      volumes: undefined,
      volumeSnapshots: undefined,
    }, () => {
      // Fire off a custom event to notify components they should reload.
      // See `DataLoader` to see how these events are consumed.
      const e = new CustomEvent('scopeChanged', { tenant })
      window.dispatchEvent(e)
    })
  }

  updateCurrentTenant = async tenantName => {
    const { context, setContext } = this.props
    const { tenants } = this.state
    this.setState(assoc('currentTenantName', tenantName), async () => {
      const tenant = tenants.find(x => x.name === tenantName)
      if (!tenant) { return }
      setContext({ currentTenant: tenant })

      const { keystone } = context.apiClient
      await keystone.changeProjectScope(tenant.id)
      this.resetTenantScopedContext(tenant)
    })
  }

  handleChoose = lastTenant => {
    const { updatePreferences } = this.props
    updatePreferences({ lastTenant })
    this.updateCurrentTenant(lastTenant)
  }

  loadTenants = async (reload = false) => {
    const { context, setContext } = this.props
    const tenants = await loadUserTenants({ context, setContext, reload })
    this.setState({ tenants })
    return tenants
  }

  tenantNames = tenants => {
    const isUserTenant = x => x.description !== 'Heat stack user project'
    return (tenants || []).filter(isUserTenant).map(x => x.name)
  }

  async componentDidMount () {
    const lastTenant = this.props.preferences.lastTenant
    const tenants = await this.loadTenants()
    if (!tenants) { return }
    this.updateCurrentTenant(lastTenant)
  }

  render () {
    const { currentTenantName, tenantSearch, tenants } = this.state

    if (!tenants) { return null }

    return (
      <Selector
        name={currentTenantName || 'service'}
        type="Tenant"
        list={this.tenantNames(tenants)}
        onChoose={this.handleChoose}
        onSearchChange={this.handleChange('tenantSearch')}
        searchTerm={tenantSearch}
      />
    )
  }
}

export default compose(
  withScopedPreferences('Tenants'),
  withAppContext
)(TenantChooser)

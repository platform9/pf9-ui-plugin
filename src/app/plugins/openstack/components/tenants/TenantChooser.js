import React from 'react'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppContext'
import Selector from 'core/components/Selector'
import { withScopedPreferences } from 'core/providers/PreferencesProvider'
import moize from 'moize'
import { assoc, propEq } from 'ramda'
import { loadUserTenants } from './actions'
import { Tooltip } from '@material-ui/core'

class TenantChooser extends React.Component {
  state = {
    tenantSearch: '',
    currentTenantName: '',
    tenants: null,
  }

  handleChange = moize(key => value => {
    this.setState({
      [key]: value,
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

    const fullTenantObj = this.state.tenants.find(propEq('name', lastTenant))
    updatePreferences({ lastTenant: fullTenantObj })
    this.updateCurrentTenant(lastTenant)
  }

  loadTenants = async (reload = false) => {
    const { getContext, setContext } = this.props
    const tenants = await loadUserTenants({ getContext, setContext, reload })
    this.setState({ tenants })
    return tenants
  }

  tenantNames = tenants => {
    const isUserTenant = x => x.description !== 'Heat stack user project'
    return (tenants || []).filter(isUserTenant).map(x => x.name)
  }

  async componentDidMount () {
    const { lastTenant } = this.props.preferences
    const tenants = await this.loadTenants()
    if (!tenants || !lastTenant) { return }
    this.updateCurrentTenant(lastTenant.name)
  }

  render () {
    const { currentTenantName, tenantSearch, tenants } = this.state

    if (!tenants) { return null }

    return (
      <Tooltip
        title="Tenant"
        placement="bottom"
        enterDelay={300}
      >
        <Selector
          className={this.props.className}
          name={currentTenantName || 'service'}
          list={this.tenantNames(tenants)}
          onChoose={this.handleChoose}
          onSearchChange={this.handleChange('tenantSearch')}
          searchTerm={tenantSearch}
        />
      </Tooltip>
    )
  }
}

export default compose(
  withScopedPreferences('Tenants'),
  withAppContext,
)(TenantChooser)

import React, { useEffect, useState, useContext } from 'react'
import ApiClient from 'api-client/ApiClient'
import { AppContext } from 'core/AppProvider'
import { emptyArr, compose } from 'app/utils/fp'
import Selector from 'core/components/Selector'
import { withScopedPreferences } from 'core/providers/PreferencesProvider'
import { propEq } from 'ramda'
import { loadUserTenants } from './actions'
import { Tooltip } from '@material-ui/core'

const TenantChooser = props => {
  const { keystone } = ApiClient.getInstance()
  const { getContext, setContext } = useContext(AppContext)

  const [tenantSearch, setTenantSearch] = useState('')
  const [currentTenantName, setCurrentTenantName] = useState('')
  const [tenants, setTenants] = useState(emptyArr)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  useEffect(() => {
    const loadTenants = async () => {
      const { lastTenant } = props.preferences
      const tenants = await loadUserTenants({ getContext, setContext })
      setTenants(tenants)
      if (!tenants || !lastTenant) { return }
      await updateCurrentTenant(lastTenant.name)
    }
    loadTenants()
  }, [])

  const resetTenantScopedContext = tenant => {
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

  const updateCurrentTenant = async tenantName => {
    await setCurrentTenantName(tenantName)

    const tenant = tenants.find(x => x.name === tenantName)
    if (!tenant) { return }
    setContext({ currentTenant: tenant })

    await keystone.changeProjectScope(tenant.id)
    resetTenantScopedContext(tenant)
  }

  const handleChoose = lastTenant => {
    const { updatePreferences } = props

    const fullTenantObj = tenants.find(propEq('name', lastTenant))
    updatePreferences({ lastTenant: fullTenantObj })
    updateCurrentTenant(lastTenant)
  }

  const tenantNames = tenants => {
    const isUserTenant = x => x.description !== 'Heat stack user project'
    return (tenants || []).filter(isUserTenant).map(x => x.name)
  }

  const handleTooltipClose = () => setTooltipOpen(false)
  const handleTooltipOpen = () => setTooltipOpen(true)

  if (!tenants) { return null }

  return (
    <Tooltip
      open={tooltipOpen}
      title="Tenant"
      placement="bottom"
    >
      <Selector
        onMouseEnter={handleTooltipOpen}
        onMouseLeave={handleTooltipClose}
        onClick={handleTooltipClose}
        className={props.className}
        name={currentTenantName || 'service'}
        list={tenantNames(tenants)}
        onChoose={handleChoose}
        onSearchChange={setTenantSearch}
        searchTerm={tenantSearch}
      />
    </Tooltip>
  )
}

export default compose(
  withScopedPreferences('Tenants'),
)(TenantChooser)

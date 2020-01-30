import React, { useState, useContext, useCallback, useMemo } from 'react'
import ApiClient from 'api-client/ApiClient'
import { AppContext } from 'core/providers/AppProvider'
import { emptyArr } from 'app/utils/fp'
import Selector from 'core/components/Selector'
import { useScopedPreferences } from 'core/providers/PreferencesProvider'
import { propEq, pipe, assoc, propOr } from 'ramda'
import { Tooltip } from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import { dataCacheKey, paramsCacheKey } from 'core/helpers/createContextLoader'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import { getStorage, setStorage } from 'core/utils/pf9Storage'

const TenantChooser = props => {
  const { keystone } = ApiClient.getInstance()
  const { updatePrefs } = useScopedPreferences('Tenants')
  const [tenantSearch, setTenantSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const { setContext, currentTenant } = useContext(AppContext)
  const [currentTenantName, setCurrentTenantName] = useState(propOr('', 'name', currentTenant))
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [tenants, loadingTenants] = useDataLoader(loadUserTenants)

  const updateCurrentTenant = async tenantName => {
    setLoading(true)
    setCurrentTenantName(tenantName)

    const tenant = tenants.find(x => x.name === tenantName)
    if (!tenant) { return }

    const { user, role, scopedToken } = await keystone.changeProjectScope(tenant.id)
    // Update localStorage scopedToken upon changing project scope
    const existingTokens = getStorage('tokens')
    setStorage('tokens', { ...existingTokens, currentToken: scopedToken })

    // Clear any data that should change when the user changes tenant.
    // The data will then be reloaded when it is needed.
    await setContext(pipe(
      // Reset all the data cache
      assoc(dataCacheKey, emptyArr),
      assoc(paramsCacheKey, emptyArr),
      // Changing the currentTenant will cause all the current active `useDataLoader`
      // hooks to reload its data
      assoc('currentTenant', tenant),
      assoc('userDetails', { ...user, role }),
    ))
    setLoading(false)
  }

  const handleChoose = useCallback(async lastTenant => {
    const fullTenantObj = tenants.find(propEq('name', lastTenant))
    updatePrefs({ lastTenant: fullTenantObj })
    await updateCurrentTenant(lastTenant)
  }, [tenants])

  const tenantNames = useMemo(() => {
    const isUserTenant = x => x.description !== 'Heat stack user project'
    return (tenants || []).filter(isUserTenant).map(x => x.name)
  }, [tenants])

  const handleTooltipClose = useCallback(() => setTooltipOpen(false))
  const handleTooltipOpen = useCallback(() => setTooltipOpen(true))

  return (
    <Tooltip
      open={tooltipOpen}
      title="Tenant"
      placement="bottom"
    >
      <Selector
        loading={loading || loadingTenants}
        onMouseEnter={handleTooltipOpen}
        onMouseLeave={handleTooltipClose}
        onClick={handleTooltipClose}
        className={props.className}
        name={currentTenantName}
        list={tenantNames}
        onChoose={handleChoose}
        onSearchChange={setTenantSearch}
        searchTerm={tenantSearch}
        type='Tenant'
      />
    </Tooltip>
  )
}

export default TenantChooser

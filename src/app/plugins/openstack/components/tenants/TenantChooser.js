import React, { useState, useCallback, useMemo } from 'react'
import ApiClient from 'api-client/ApiClient'
import Selector from 'core/components/Selector'
import { useScopedPreferences } from 'core/providers/PreferencesProvider'
import { propEq, propOr, prop } from 'ramda'
import { Tooltip } from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import { getStorage, setStorage } from 'core/utils/pf9Storage'
import { useSelector, useDispatch } from 'react-redux'
import { cacheActions } from 'core/caching/cacheReducers'
import { sessionActions, sessionStoreKey } from 'core/session/sessionReducers'

const TenantChooser = props => {
  const { keystone } = ApiClient.getInstance()
  const { updatePrefs } = useScopedPreferences('Tenants')
  const [tenantSearch, setTenantSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const session = useSelector(prop(sessionStoreKey))
  const { currentTenant } = session
  const [currentTenantName, setCurrentTenantName] = useState(propOr('', 'name', currentTenant))
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [tenants, loadingTenants] = useDataLoader(loadUserTenants)
  const dispatch = useDispatch()

  const updateCurrentTenant = async tenantName => {
    setLoading(true)
    setCurrentTenantName(tenantName)

    const tenant = tenants.find(x => x.name === tenantName)
    if (!tenant) { return }

    const { user, role, scopedToken } = await keystone.changeProjectScope(tenant.id)
    // Update localStorage scopedToken upon changing project scope
    const existingTokens = getStorage('tokens')
    setStorage('tokens', { ...existingTokens, currentToken: scopedToken })
    dispatch(sessionActions.updateSession({
      currentTenant: tenant,
      userDetails: { ...user, role },
    }))
    // Clearing the cache will cause all the current loaders to reload its data
    dispatch(cacheActions.clearCache())

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

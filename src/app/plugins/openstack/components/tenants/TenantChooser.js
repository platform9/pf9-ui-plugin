import React, { useEffect, useState, useCallback, useMemo } from 'react'
import ApiClient from 'api-client/ApiClient'
import Selector from 'core/components/Selector'
import { propEq, prop, pipe, head, find, isEmpty } from 'ramda'
import { Tooltip } from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import { useDispatch, useSelector } from 'react-redux'
import { cacheActions } from 'core/caching/cacheReducers'
import { sessionActions, sessionStoreKey } from 'core/session/sessionReducers'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { updateClarityStore } from 'utils/clarityHelper'

const TenantChooser = (props) => {
  const { keystone } = ApiClient.getInstance()
  const [tenantSearch, setTenantSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [{ currentTenant, currentRegion }, updatePrefs] = useScopedPreferences()
  const [selectedTenantName, setSelectedTenantName] = useState()
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [tenants, loadingTenants, reloadTenants] = useDataLoader(loadUserTenants)
  const selectSessionState = prop(sessionStoreKey)
  const session = useSelector(selectSessionState)
  const { isSsoToken } = session
  const dispatch = useDispatch()
  const curTenantName = useMemo(() => {
    if (selectedTenantName) {
      return selectedTenantName
    }
    if (currentTenant) {
      return pipe(find(propEq('id', currentTenant)), prop('name'))(tenants)
    }
    // match setupSession from AppContainer, set to service tenant if it exists
    const tenant = tenants.find(propEq('name', currentTenant || 'service')) || head(tenants)
    return tenant.name
  }, [tenants, currentTenant, selectedTenantName])

  useEffect(() => {
    // Reload tenants when changing the current region
    if (isEmpty(tenants) && loadingTenants === undefined) {
      reloadTenants(true)
    }
  }, [currentRegion, tenants])

  useEffect(() => {
    if (curTenantName && tenants.length && !currentTenant) {
      // Set currentTenant in prefs on first-ever load
      const tenant = tenants.find((t) => curTenantName === t.name)
      updatePrefs({ currentTenant: tenant.id })
    }
  }, [curTenantName, tenants])

  const updateCurrentTenant = async (tenantName) => {
    setLoading(true)
    setSelectedTenantName(tenantName)

    const tenant = tenants.find(propEq('name', tenantName))
    if (!tenant) {
      return
    }

    const { user, role, scopedToken } = await keystone.changeProjectScope(tenant.id, isSsoToken)
    dispatch(
      sessionActions.updateSession({
        userDetails: { ...user, role },
        scopedToken,
      }),
    )
    updatePrefs({
      currentTenant: tenant.id,
    })
    // Clearing the cache will cause all the current loaders to reload its data
    dispatch(cacheActions.clearCache())

    setLoading(false)
  }

  const handleTenantSelect = useCallback(
    async (currentTenant) => {
      const fullTenantObj = tenants.find(propEq('name', currentTenant))
      updateClarityStore('tenantObj', fullTenantObj)
      updatePrefs({ currentTenant: fullTenantObj.id })
      await updateCurrentTenant(currentTenant)
    },
    [tenants],
  )

  const tenantNames = useMemo(() => {
    const isUserTenant = (x) => x.description !== 'Heat stack user project'
    return (tenants || []).filter(isUserTenant).map((x) => x.name)
  }, [tenants])

  const handleTooltipClose = useCallback(() => setTooltipOpen(false))
  const handleTooltipOpen = useCallback(() => setTooltipOpen(true))

  return (
    <Tooltip open={tooltipOpen} title="Tenant" placement="bottom">
      <Selector
        renderContentOnMount
        loading={loading || loadingTenants}
        onMouseEnter={handleTooltipOpen}
        onMouseLeave={handleTooltipClose}
        onClick={handleTooltipClose}
        className={props.className}
        name={curTenantName || 'Current Tenant'}
        list={tenantNames}
        onChoose={handleTenantSelect}
        onSearchChange={setTenantSearch}
        searchTerm={tenantSearch}
        type="Tenant"
      />
    </Tooltip>
  )
}

export default TenantChooser

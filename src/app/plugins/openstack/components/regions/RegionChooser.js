import React, { useState, useCallback, useMemo, useEffect } from 'react'
import useReactRouter from 'use-react-router'
import Selector from 'core/components/Selector'
import { pluck, propEq, find, pipe, head, prop, isEmpty } from 'ramda'
import { Tooltip } from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import { regionActions } from 'k8s/components/infrastructure/common/actions'
import { cacheActions } from 'core/caching/cacheReducers'
import ApiClient from 'api-client/ApiClient'
import { appUrlRoot } from 'app/constants'
import { useDispatch } from 'react-redux'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { updateClarityStore } from 'utils/clarityHelper'

const currentSectionRegex = new RegExp(`^${appUrlRoot}/[^/]+/?[^/]*`, 'i')

const RegionChooser = (props) => {
  const { keystone, setActiveRegion } = ApiClient.getInstance()
  const { history, location } = useReactRouter()
  const { pathname, hash = '' } = location
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const { prefs, updatePrefs } = useScopedPreferences()
  const { currentTenant, currentRegion } = prefs
  const [loading, setLoading] = useState(false)
  const [regionSearch, setSearchText] = useState('')
  const [regions, loadingRegions, reloadRegions] = useDataLoader(regionActions.list)
  const dispatch = useDispatch()
  const [selectedRegion, setRegion] = useState()

  const curRegionId = useMemo(() => {
    if (selectedRegion) {
      return selectedRegion
    }
    if (currentRegion && find(propEq('id', currentRegion), regions)) {
      return currentRegion
    }
    return pipe(head, prop('id'))(regions)
  }, [regions, currentRegion, selectedRegion, regions])

  useEffect(() => {
    // Reload region when changing the current tenant
    if (isEmpty(regions) && loadingRegions === undefined) {
      reloadRegions(true)
    }
  }, [currentTenant, regions])

  const handleRegionSelect = useCallback(
    async (regionId) => {
      setLoading(true)

      try {
        const [currentSection = appUrlRoot] = currentSectionRegex.exec(pathname + hash) || []

        updateClarityStore(
          'regionObj',
          regions.find((r) => regionId === r.id),
        )
        setRegion(regionId)
        setActiveRegion(regionId)

        await keystone.resetCookie()

        await ApiClient.refreshApiEndpoints()

        await dispatch(cacheActions.clearCache())

        // Redirect to the root of the current section (there's no need to reload all the app)
        // Must be done prior to updatePrefs until improved url management system is in place
        // bc of listener in AuthenticatedContainer which may also redirect
        history.push(currentSection)

        updatePrefs({ currentRegion: regionId })
      } catch (err) {
        console.error(err)
      }

      setLoading(false)
    },
    [regions, pathname, hash],
  )

  const handleTooltipClose = useCallback(() => setTooltipOpen(false), [])
  const handleTooltipOpen = useCallback(() => setTooltipOpen(true), [])

  const regionNames = useMemo(() => pluck('id', regions), [regions])

  useEffect(() => {
    if (!curRegionId || !regions.length) {
      return
    }
    updateClarityStore(
      'regionObj',
      regions.find((r) => curRegionId === r.id),
    )
    if (!currentRegion) {
      // Set currentRegion in prefs on first-ever load
      updatePrefs({ currentRegion: curRegionId })
      setActiveRegion(curRegionId)
    }
  }, [curRegionId, regions])

  return (
    <Tooltip open={tooltipOpen} title="Region" placement="bottom">
      <Selector
        renderContentOnMount
        loading={loading || loadingRegions}
        onMouseEnter={handleTooltipOpen}
        onMouseLeave={handleTooltipClose}
        onClick={handleTooltipClose}
        className={props.className}
        name={curRegionId || 'Current Region'}
        list={regionNames}
        onChoose={handleRegionSelect}
        onSearchChange={setSearchText}
        searchTerm={regionSearch}
        type="Region"
      />
    </Tooltip>
  )
}

export default RegionChooser

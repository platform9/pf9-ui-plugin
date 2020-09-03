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

const currentSectionRegex = new RegExp(`^${appUrlRoot}/[^/]+/?[^/]*`, 'i')

const RegionChooser = (props) => {
  const { keystone, setActiveRegion } = ApiClient.getInstance()
  const { history, location } = useReactRouter()
  const { pathname, hash = '' } = location
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [{ currentTenant, currentRegion }, updatePrefs] = useScopedPreferences()
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
      const [currentSection = appUrlRoot] = currentSectionRegex.exec(pathname + hash) || []
      setLoading(true)
      setRegion(regionId)
      setActiveRegion(regionId)
      await keystone.resetCookie()

      updatePrefs({ currentRegion: regionId })
      // Clearing the cache will cause all the current loaders to reload its data
      await dispatch(cacheActions.clearCache())

      // Redirect to the root of the current section (there's no need to reload all the app)
      history.push(currentSection)

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
    updatePrefs({ currentRegion: curRegionId })
    setActiveRegion(curRegionId)
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

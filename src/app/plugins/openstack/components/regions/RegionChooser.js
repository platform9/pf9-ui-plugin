import React, { useState, useCallback, useMemo, useEffect } from 'react'
import useReactRouter from 'use-react-router'
import Selector from 'core/components/Selector'
import { pluck, propEq, find, pipe, head, prop } from 'ramda'
import { useScopedPreferences } from 'core/providers/PreferencesProvider'
import { Tooltip } from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import { regionActions } from 'k8s/components/infrastructure/common/actions'
import { sessionActions } from 'core/session/sessionReducers'
import { cacheActions } from 'core/caching/cacheReducers'
import ApiClient from 'api-client/ApiClient'
import { appUrlRoot } from 'app/constants'
import { useDispatch } from 'react-redux'

const currentSectionRegex = new RegExp(`^${appUrlRoot}/[^/]+/?[^/]*`, 'i')

const RegionChooser = props => {
  const { keystone, setActiveRegion } = ApiClient.getInstance()
  const { history, location } = useReactRouter()
  const { pathname, hash = '' } = location
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const { prefs: { lastRegion }, updatePrefs } = useScopedPreferences('RegionChooser')
  const [loading, setLoading] = useState(false)
  const [regionSearch, setSearchText] = useState('')
  const [regions, loadingRegions] = useDataLoader(regionActions.list)
  const dispatch = useDispatch()
  const [selectedRegion, setRegion] = useState()
  const curRegionId = useMemo(() => {
    if (selectedRegion) {
      return selectedRegion
    }
    if (lastRegion && find(propEq('id', lastRegion.id), regions)) {
      return lastRegion.id
    }
    return pipe(head, prop('id'))(regions)
  }, [regions, lastRegion, selectedRegion])

  const handleRegionSelect = useCallback(async region => {
    const [currentSection = appUrlRoot] = currentSectionRegex.exec(pathname + hash) || []
    setLoading(true)
    setRegion(region)
    setActiveRegion(region)
    await keystone.resetCookie()

    dispatch(sessionActions.updateSession({
      currentRegion: region,
    }))
    // Clearing the cache will cause all the current loaders to reload its data
    dispatch(cacheActions.clearCache())

    // Redirect to the root of the current section (there's no need to reload all the app)
    history.push(currentSection)

    setLoading(false)
  }, [regions, pathname, hash])

  const handleTooltipClose = useCallback(() => setTooltipOpen(false))
  const handleTooltipOpen = useCallback(() => setTooltipOpen(true))

  const regionNames = useMemo(() => pluck('id', regions), [regions])

  useEffect(() => {
    if (!curRegionId || !regions.length) { return }
    const lastRegion = regions.find(propEq('id', curRegionId))
    updatePrefs({ lastRegion })
  }, [curRegionId, regions])

  return (
    <Tooltip
      open={tooltipOpen}
      title="Region"
      placement="bottom"
    >
      <Selector
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
        type='Region'
      />
    </Tooltip>
  )
}

export default RegionChooser

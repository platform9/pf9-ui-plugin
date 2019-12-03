import React, { useState, useCallback, useMemo, useContext, useEffect } from 'react'
import useReactRouter from 'use-react-router'
import Selector from 'core/components/Selector'
import { pluck, propEq, find, pipe, head, prop, assoc } from 'ramda'
import { useScopedPreferences } from 'core/providers/PreferencesProvider'
import { Tooltip } from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import { regionActions } from 'k8s/components/infrastructure/common/actions'
import { AppContext } from 'core/providers/AppProvider'
import { invalidateLoadersCache } from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import { appUrlRoot } from 'app/constants'

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
  const { setContext } = useContext(AppContext)
  const [selectedRegion, setRegion] = useState()
  const curRegion = useMemo(() => {
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
    const lastRegion = regions.find(propEq('id', region))
    await updatePrefs({ lastRegion })
    setActiveRegion(region)
    await keystone.resetCookie()
    invalidateLoadersCache()

    // Changing the Region will cause all the current active `useDataLoader`
    // hooks to reload its data
    setContext(assoc('currentRegion', region))

    // Redirect to the root of the current section (there's no need to reload all the app)
    history.push(currentSection)

    setLoading(false)
  }, [regions, pathname, hash])

  const handleTooltipClose = useCallback(() => setTooltipOpen(false))
  const handleTooltipOpen = useCallback(() => setTooltipOpen(true))

  const regionNames = useMemo(() => pluck('id', regions), [regions])

  useEffect(() => {
    const lastRegion = regions.find(propEq('id', curRegion))
    updatePrefs({ lastRegion })
  }, [curRegion])

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
        name={curRegion || 'Current Region'}
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

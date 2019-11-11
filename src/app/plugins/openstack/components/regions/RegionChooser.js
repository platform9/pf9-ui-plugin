import React, { useState, useCallback, useMemo } from 'react'
import Selector from 'core/components/Selector'
import { pluck, propEq, find, pipe, head, prop } from 'ramda'
import { useScopedPreferences } from 'core/providers/PreferencesProvider'
import { Tooltip } from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import { regionActions } from 'k8s/components/infrastructure/common/actions'
import { appUrlRoot } from 'app/constants'

const RegionChooser = props => {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const { prefs: { lastRegion }, updatePrefs } = useScopedPreferences('RegionChooser')
  const [loading, setLoading] = useState(false)
  const [regionSearch, setSearchText] = useState('')
  const [regions, loadingRegions] = useDataLoader(regionActions.list)
  const [selectedRegion, setRegion] = useState()
  const curRegion = useMemo(() => {
    if (selectedRegion) {
      return selectedRegion
    }
    if (lastRegion && find(propEq('id', lastRegion.id), regions)) {
      return lastRegion.id
    }
    return pipe(head, prop('id'))(regions) || 'Current Region'
  }, [regions, lastRegion, selectedRegion])
  const handleRegionSelect = useCallback(async region => {
    setLoading(true)
    setRegion(region)
    const lastRegion = regions.find(propEq('id', region))
    await updatePrefs({ lastRegion })

    // Initial loading of the app is tightly coupled to knowing the region to use.
    // Reloading the app when the region changes is the simplest and most robust solution.
    // FIXME this can probably be avoided using the commented code below
    window.location.href = appUrlRoot
    // await setContext(pipe(
    //   // Reset all the data cache
    //   assoc(dataCacheKey, emptyArr),
    //   assoc(paramsCacheKey, emptyArr),
    //   // Changing the currentTenant will cause all the current active `useDataLoader`
    //   // hooks to reload its data
    //   assoc('currentRegion', region),
    // ))
    // setLoading(false)
  }, [regions])

  const handleTooltipClose = useCallback(() => setTooltipOpen(false))
  const handleTooltipOpen = useCallback(() => setTooltipOpen(true))

  const regionNames = useMemo(() => pluck('id', regions), [regions])

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
        name={curRegion}
        list={regionNames}
        onChoose={handleRegionSelect}
        onSearchChange={setSearchText}
        searchTerm={regionSearch}
      />
    </Tooltip>
  )
}

export default RegionChooser

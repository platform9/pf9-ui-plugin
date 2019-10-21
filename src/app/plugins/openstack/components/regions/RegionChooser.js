import React, { useState, useCallback, useMemo } from 'react'
import ApiClient from 'api-client/ApiClient'
import Selector from 'core/components/Selector'
import { pluck, propEq, prop } from 'ramda'
import { useScopedPreferences } from 'core/providers/PreferencesProvider'
import { Tooltip } from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import { regionActions } from 'k8s/components/infrastructure/common/actions'
import { appUrlRoot } from 'app/constants'

const apiClient = ApiClient.getInstance()

const RegionChooser = props => {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const { prefs, updatePrefs } = useScopedPreferences('RegionChooser')
  const { lastRegion } = prefs
  const [loading, setLoading] = useState(false)
  const [curRegion, setRegion] = useState(apiClient.activeRegion || prop('id', lastRegion))
  const [regionSearch, setSearchText] = useState('')
  // const { setContext } = useContext(AppContext)

  const [regions, loadingRegions] = useDataLoader(regionActions.list)

  const handleRegionSelect = useCallback(async region => {
    setLoading(true)
    setRegion(region)
    // Future Todo: Update the Selector component or create a variant of the component
    // that can take a list of objects
    const fullRegionObj = regions.find(propEq('id', region))
    await updatePrefs({ lastRegion: fullRegionObj })

    // Initial loading of the app is tightly coupled to knowing the region to use.
    // Reloading the app when the region changes is the simplest and most robust solution.
    // FIXME this can probably be avoided using the commented code below
    window.location = appUrlRoot
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
        name={!curRegion || curRegion.length === 0 ? 'Current Region' : curRegion}
        list={regionNames}
        onChoose={handleRegionSelect}
        onSearchChange={setSearchText}
        searchTerm={regionSearch}
      />
    </Tooltip>
  )
}

export default RegionChooser

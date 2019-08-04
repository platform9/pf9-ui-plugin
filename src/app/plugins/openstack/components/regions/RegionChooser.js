import React from 'react'
import Selector from 'core/components/Selector'
import { appUrlRoot } from 'app/constants'
import { compose, pluck, propEq, pathOr } from 'ramda'
import { withAppContext } from 'core/AppContext'
import { withScopedPreferences } from 'core/providers/PreferencesProvider'
import contextLoader from 'core/helpers/contextLoader'
import withDataLoader from 'core/hocs/withDataLoader'
import withDataMapper from 'core/hocs/withDataMapper'
import { Tooltip } from '@material-ui/core'

const loadRegions = contextLoader('regions', async ({ apiClient }) => {
  return apiClient.keystone.getRegions()
})

class RegionChooser extends React.Component {
  state = {
    curRegion: '',
    regionSearch: '',
  }

  componentDidMount () {
    const { context } = this.props
    this.setState({ curRegion: context.apiClient.activeRegion })
  }

  handleSearchChange = regionSearch => this.setState({ regionSearch })

  handleRegionSelect = region => {
    this.setState({ curRegion: region })
    // Future Todo: Update the Selector component or create a variant of the component
    // that can take a list of objects
    const fullRegionObj = this.props.data.regions.find(propEq('id', region))
    this.props.updatePreferences({ lastRegion: fullRegionObj })

    // Initial loading of the app is tightly coupled to knowing the region to use.
    // Reloading the app when the region changes is the simplest and most robust solution.
    window.location = appUrlRoot
  }

  render () {
    const { curRegion, regionSearch } = this.state
    const { data: { regions = [] }, className } = this.props

    const regionNames = pluck('id', regions)

    return (
      <Tooltip
        title="Region"
        placement="bottom-start"
        enterDelay={300}
      >
        <Selector
          className={className}
          name={!curRegion || curRegion.length === 0 ? 'Current Region' : curRegion}
          list={regionNames}
          onChoose={this.handleRegionSelect}
          onSearchChange={this.handleSearchChange}
          searchTerm={regionSearch}
        />
      </Tooltip>
    )
  }
}

export default compose(
  withAppContext,
  withDataLoader({ regions: loadRegions }, { inlineProgress: true }),
  withDataMapper({
    regions: pathOr([], ['context', 'regions']),
  }),
  withScopedPreferences('RegionChooser'),
)(RegionChooser)

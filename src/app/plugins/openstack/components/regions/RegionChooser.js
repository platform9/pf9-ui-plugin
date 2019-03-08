import React from 'react'
import Selector from 'core/components/Selector'
import { appUrlRoot } from 'app/constants'
import { compose, pluck } from 'ramda'
import { withDataLoader } from 'core/DataLoader'
import { withScopedPreferences } from 'core/providers/PreferencesProvider'

const loadRegions = async ({ context, setContext, reload }) => {
  if (!reload && context.regions) { return context.regions }
  const regions = await context.apiClient.keystone.getRegions()
  setContext({ regions })
  return regions
}

class RegionChooser extends React.Component {
  state = {
    curRegion: '',
    regionSearch: '',
  }

  componentDidMount () {
    const { lastRegion } = this.props.preferences
    if (lastRegion) { this.setState({ curRegion: lastRegion }) }
  }

  handleSearchChange = regionSearch => this.setState({ regionSearch })

  handleRegionSelect = region => {
    this.setState({ curRegion: region })
    this.props.updatePreferences({ lastRegion: region })

    // Initial loading of the app is tightly coupled to knowing the region to use.
    // Reloading the app when the region changes is the simplest and most robust solution.
    window.location = appUrlRoot
  }

  render () {
    const { curRegion, regionSearch } = this.state

    const regionNames = pluck('id', this.props.data)

    return (
      <Selector
        className={this.props.className}
        name={curRegion.length === 0 ? 'Current Region' : curRegion}
        type="Region"
        list={regionNames}
        onChoose={this.handleRegionSelect}
        onSearchChange={this.handleSearchChange}
        searchTerm={regionSearch}
      />
    )
  }
}

export default compose(
  withDataLoader({ dataKey: 'regions', loaderFn: loadRegions }),
  withScopedPreferences('RegionChooser'),
)(RegionChooser)

import React from 'react'
import Selector from 'core/components/Selector'
import { appUrlRoot } from 'app/constants'
import { compose, pluck, propEq } from 'ramda'
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
    if (lastRegion) { this.setState({ curRegion: lastRegion.id }) }
  }

  handleSearchChange = regionSearch => this.setState({ regionSearch })

  handleRegionSelect = region => {
    this.setState({ curRegion: region })
    // Future Todo: Update the Selector component or create a variant of the component
    // that can take a list of objects
    const fullRegionObj = this.props.data.find(propEq('id', region))
    this.props.updatePreferences({ lastRegion: fullRegionObj })

    // Initial loading of the app is tightly coupled to knowing the region to use.
    // Reloading the app when the region changes is the simplest and most robust solution.
    window.location = appUrlRoot
  }

  render () {
    const { curRegion, regionSearch } = this.state
    const { data = [], className } = this.props

    const regionNames = pluck('id', data)

    return (
      <Selector
        className={className}
        name={!curRegion || curRegion.length === 0 ? 'Current Region' : curRegion}
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
  withDataLoader({ dataKey: 'regions', loaderFn: loadRegions }, { inlineProgress: true }),
  withScopedPreferences('RegionChooser'),
)(RegionChooser)

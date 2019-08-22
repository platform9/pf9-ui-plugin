import React from 'react'
import ApiClient from 'api-client/ApiClient'
import Selector from 'core/components/Selector'
import { appUrlRoot } from 'app/constants'
import { compose, pluck, propEq, propOr } from 'ramda'
import { withAppContext } from 'core/AppProvider'
import { withScopedPreferences } from 'core/providers/PreferencesProvider'
import createContextLoader from 'core/helpers/createContextLoader'
import withDataLoader from 'core/hocs/withDataLoader'
import withDataMapper from 'core/hocs/withDataMapper'
import { Tooltip } from '@material-ui/core'

const loadRegions = createContextLoader('regionChooser', async () => {
  const { keystone } = ApiClient.getInstance()
  return keystone.getRegions()
})

class RegionChooser extends React.Component {
  state = {
    curRegion: '',
    regionSearch: '',
    tooltipOpen: false,
  }

  componentDidMount () {
    this.setState({ curRegion: ApiClient.getInstance().activeRegion })
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

  handleTooltipClose = () => this.setState({ tooltipOpen: false })
  handleTooltipOpen = () => this.setState({ tooltipOpen: true })

  render () {
    const { curRegion, regionSearch, tooltipOpen } = this.state
    const { data: { regions = [] }, className } = this.props
    const regionNames = pluck('id', regions)

    return (
      <Tooltip
        open={tooltipOpen}
        title="Region"
        placement="bottom"
      >
        <Selector
          onMouseEnter={this.handleTooltipOpen}
          onMouseLeave={this.handleTooltipClose}
          onClick={this.handleTooltipClose}
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
  withDataMapper({ regions: propOr([], 'regionChooser') }),
  withScopedPreferences('RegionChooser'),
)(RegionChooser)

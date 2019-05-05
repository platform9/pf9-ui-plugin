import React from 'react'
import PropTypes from 'prop-types'
import MultiSelect from 'core/components/MultiSelect'
import { allPass, compose } from 'ramda'
import { withDataLoader } from 'core/DataLoader'
import { withInfoTooltip } from 'core/components/InfoTooltip'
import { loadCombinedHosts } from 'k8s/components/infrastructure/actions'

class NodesChooser extends React.Component {
  state = {
    selected: [],
  }

  handleMultiSelect = selected => {
    this.setState({ selected })
    this.props.onChange(selected)
  }

  validSelection = () => [1, 3, 5].contains(this.state.selected.length)

  render () {
    const { data, label, name } = this.props
    const authorized = x => x.uiState !== 'unauthorized'
    const validCloudStack = x => x.cloudStack === 'k8s' || x.cloudStack === 'both'
    const hasQbert = x => !!x.qbert
    const pending = x => x.uiState === 'unauthorized'
    const authorizedK8sHosts = data.filter(allPass([authorized, validCloudStack, hasQbert]))
    const pendingHosts = data.filter(pending)
    const hosts = [...authorizedK8sHosts, ...pendingHosts]
    const hostOptions = hosts.map(h => ({
      value: h.resmgr.id,
      label: h.resmgr.info.hostname,
    }))
    return (
      <React.Fragment>
        <MultiSelect
          name={name}
          label={label}
          options={hostOptions}
          onChange={this.handleMultiSelect}
          value={this.state.selected}
        />
      </React.Fragment>
    )
  }
}

NodesChooser.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default compose(
  withDataLoader({ combinedHosts: loadCombinedHosts }),
  withInfoTooltip,
)(NodesChooser)

import { combinedHostsSelector } from 'k8s/components/infrastructure/common/selectors'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import React from 'react'
import PropTypes from 'prop-types'
import MultiSelect from 'core/components/MultiSelect'
import { allPass, compose } from 'ramda'
import { withInfoTooltip } from 'core/components/InfoTooltip'
import { connect } from 'react-redux'

@connect((state) => ({
  combinedHosts: combinedHostsSelector(state),
}))
class NodesChooser extends React.PureComponent {
  state = {
    selected: [],
  }

  async componentDidMount() {
    await loadNodes()
  }

  handleMultiSelect = (selected) => {
    this.setState({ selected })
    this.props.onChange(selected)
  }

  validSelection = () => [1, 3, 5].contains(this.state.selected.length)

  render() {
    const { combinedHosts, label, name } = this.props
    const authorized = (x) => x.uiState !== 'unauthorized'
    const validCloudStack = (x) => x.cloudStack === 'k8s' || x.cloudStack === 'both'
    const hasQbert = (x) => !!x.qbert
    const pending = (x) => x.uiState === 'unauthorized'
    const authorizedK8sHosts = combinedHosts.filter(
      allPass([authorized, validCloudStack, hasQbert]),
    )
    const pendingHosts = combinedHosts.filter(pending)
    const hosts = [...authorizedK8sHosts, ...pendingHosts]
    const hostOptions = hosts.map((h) => ({
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
          values={this.state.selected}
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

export default compose(withInfoTooltip)(NodesChooser)

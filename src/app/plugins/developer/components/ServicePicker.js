import React from 'react'
import PropTypes from 'prop-types'
import { arrToObjByKey, compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppProvider'
import Picklist from 'core/components/Picklist'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'
import { prop } from 'ramda'

class ServicePicker extends React.Component {
  state = {
    services: [],
    catalog: {},
    isMounted: false,
  }

  async componentDidMount () {
    this.setState(
      // For some strange reason the component is being unmounted before
      // loadServiceCatalog completes.  Need this hack to work around it.
      { isMounted: true },
      async () => {
        const { getContext, setContext } = this.props
        const catalog = await loadServiceCatalog({ getContext, setContext })
        const catalogMap = arrToObjByKey('name', catalog)
        if (this.state.isMounted) {
          this.setState({
            catalog: catalogMap,
            services: catalog.map(prop('name')).sort()
          })
        }
      }
    )
  }

  componentWillUnmount () {
    this.setState({ isMounted: false })
  }

  handleChange = service => {
    const { onChange } = this.props
    const { catalog } = this.state

    let baseUrl = catalog[service].url

    // Handle the weird cases where we can't use the catalog's url as is.
    if (service === 'keystone') {
      // TODO: need to switch to v3
    }
    if (service === 'qbert') {
      // TODO: qbert requires the current tenant in the url
    }

    if (onChange) {
      onChange({ service, baseUrl })
    }
  }

  render () {
    return (
      <Picklist
        name="service"
        label="API service"
        options={this.state.services}
        onChange={this.handleChange}
        value={this.props.value}
      />
    )
  }
}

ServicePicker.propTypes = {
  /*
   * `onChange` gets passed the following:
   * {
   *   service: The name of the service,
   *   baseUrl: 'suggested base URL based on the service'
   * }
   */
  onChange: PropTypes.func,
  value: PropTypes.string.isRequired,
}

export default compose(
  withAppContext,
)(ServicePicker)

import React from 'react'
import PropTypes from 'prop-types'

class PropertyInspector extends React.Component {
  render () {
    const { node } = this.props

    if (!node) {
      return <h3>No node selected</h3>
    }

    return (
      <div>
        <h1>Property Inspector</h1>
      </div>
    )
  }
}

PropertyInspector.propTypes = {
  node: PropTypes.object,
}

export default PropertyInspector

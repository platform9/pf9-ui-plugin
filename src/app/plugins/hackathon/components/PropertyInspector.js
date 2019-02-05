import React from 'react'
import PropTypes from 'prop-types'
import StartPropertyPanel from './panels/StartPropertyPanel'
import ActivityPropertyPanel from './panels/ActivityPropertyPanel'

class PropertyInspector extends React.Component {
  render () {
    const { node } = this.props

    if (!node) {
      return <h3>No node selected</h3>
    }

    return (
      <div>
        {node.type === 'start' && <StartPropertyPanel {...this.props} />}
        {node.type === 'activity' && <ActivityPropertyPanel {...this.props} />}
      </div>
    )
  }
}

PropertyInspector.propTypes = {
  node: PropTypes.object,
  onChange: PropTypes.func.isRequired,
}

export default PropertyInspector

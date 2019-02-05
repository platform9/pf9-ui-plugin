import React from 'react'
import PropTypes from 'prop-types'
import Draggable from '../Draggable'

class StartSymbol extends React.Component {
  render () {
    const { x, y, ...rest } = this.props
    return (
      <Draggable x={x} y={y} {...rest}>
        <circle cx={0} cy={0} fill="black" r="10" />
      </Draggable>
    )
  }
}

StartSymbol.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
}

export default StartSymbol

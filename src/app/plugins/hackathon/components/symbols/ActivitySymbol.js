import React from 'react'
import PropTypes from 'prop-types'
import Draggable from '../Draggable'

const width = 100
const height = 50

class ActivitySymbol extends React.Component {
  render () {
    const { label, x, y, ...rest } = this.props
    return (
      <Draggable x={x} y={y} {...rest}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          stroke="black"
          strokeWidth="3"
          rx="10"
          ry="10"
          fill="white"
        />
        <text
          x={width / 2}
          y={height / 2}
          dominantBaseline="middle"
          textAnchor="middle"
        >
          {label}
        </text>
      </Draggable>
    )
  }
}

ActivitySymbol.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  label: PropTypes.string,
}

ActivitySymbol.defaultProps = {
  label: 'change me',
}

export default ActivitySymbol

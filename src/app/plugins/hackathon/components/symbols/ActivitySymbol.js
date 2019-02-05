import React from 'react'
import PropTypes from 'prop-types'
import Draggable from '../Draggable'

export const width = 150
export const height = 50

export const wireStart = node => [node.x + width / 2, node.y + height / 2]
export const wireEnd = node => [node.x + width / 2, node.y + height / 2]

export const addActivityNode = props => {
  const x = props.x - width / 2
  const y = props.y - height / 2

  return ({ x, y })
}

class ActivitySymbol extends React.Component {
  componentDidMount () {
    this.setWidthByLabel()
  }

  setWidthByLabel = () => {

  }
  render () {
    const { label, x, y, width, height, ...rest } = this.props
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
          style={{ userSelect: 'none' }}
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
  label: 'label',
  width,
  height,
}

export default ActivitySymbol

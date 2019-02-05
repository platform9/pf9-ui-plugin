import React from 'react'
import PropTypes from 'prop-types'

const Grid = ({ opacity, minorTick, majorTick, width, height, majorOpacity, minorOpacity }) => {
  let gridLines = []

  const endX = width * 10
  const startX = -endX
  const endY = height * 10
  const startY = -endY

  const drawLine = (type, position) => {
    let strokeOpacity = position % majorTick === 0 ? majorOpacity : minorOpacity

    if (type === 'horizontal') {
      return (
        <line
          key={`h${position}`}
          x1={startX}
          y1={position}
          x2={endX}
          y2={position}
          stroke="black"
          strokeOpacity={strokeOpacity}
        />
      )
    }
    if (type === 'vertical') {
      return (
        <line
          key={`v${position}`}
          x1={position}
          y1={startY}
          x2={position}
          y2={endY}
          stroke="black"
          strokeOpacity={strokeOpacity}
        />
      )
    }
  }

  for (let offset=startX; offset <= endX; offset += minorTick) {
    gridLines.push(drawLine('vertical', offset))
  }
  for (let offset=startY; offset <= endY; offset += minorTick) {
    gridLines.push(drawLine('horizontal', offset))
  }

  return (
    <g>
      {gridLines}
    </g>
  )
}

Grid.propTypes = {
  minorTick: PropTypes.number.isRequired,
  majorTick: PropTypes.number.isRequired,
  opacity: PropTypes.number,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  minorOpacity: PropTypes.number,
  majorOpacity: PropTypes.number,
}

Grid.defaultProps = {
  tickSpacing: 10,
  minorOpacity: 0.05,
  majorOpacity: 0.2,
}

export default Grid

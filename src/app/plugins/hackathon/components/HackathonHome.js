import React from 'react'
import Draggable from './Draggable'
import SVGCanvas from './SVGCanvas'

class HackathonHome extends React.Component {
  render () {
    return (
      <div>
        <h1>Hackathon Home</h1>
        <SVGCanvas width={800} height={800}>
          <Draggable onChange={this.handleDrag}>
            <g>
              <rect x="50" y="50" width="50" height="50" fill="#bbc42a" />
            </g>
          </Draggable>
        </SVGCanvas>
      </div>
    )
  }
}

export default HackathonHome

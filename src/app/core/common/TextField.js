import React from 'react'

import { Consumer } from 'core/common/ValidatedForm'

class TextField extends React.Component {
  render () {
    return (
      <Consumer>
        {({ setField }) => (
          <input type="text" onChange={e => setField(this.props.id, e.target.value)} />
        )}
      </Consumer>
    )
  }
}

export default TextField

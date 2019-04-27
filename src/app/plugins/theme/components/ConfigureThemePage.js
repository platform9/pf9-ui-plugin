import React from 'react'
import { SketchPicker } from 'react-color'

import { withAppContext } from 'core/AppContext'

class ConfigureThemePage extends React.Component {
  render () {
    const { context } = this.props
    const { theme } = context

    return (
      <div>
        <h1>Configure Theme</h1>
        <SketchPicker />

        <pre>{JSON.stringify(theme, null, 4)}</pre>
      </div>
    )
  }
}

export default withAppContext(ConfigureThemePage)

import React from 'react'
import ColorPicker from './ColorPicker'
import { Grid } from '@material-ui/core'
import KitchenSink from './KitchenSink'
import Panel from './Panel'

class ConfigureThemePage extends React.Component {
  render () {
    return (
      <div>
        <h1>Configure Theme</h1>

        <Grid container spacing={24}>
          <Grid item xs={8}>
            <KitchenSink />
          </Grid>
          <Grid item xs={4}>
            <Panel title="Palette">
              <ColorPicker path="palette.common.white" />
              <ColorPicker path="palette.common.black" />
              <br />

              <ColorPicker path="palette.background.paper" />
              <ColorPicker path="palette.background.default" />
              <br />

              <ColorPicker path="palette.primary.light" />
              <ColorPicker path="palette.primary.main" />
              <ColorPicker path="palette.primary.dark" />
              <ColorPicker path="palette.primary.contrastText" />
              <br />

              <ColorPicker path="palette.secondary.light" />
              <ColorPicker path="palette.secondary.main" />
              <ColorPicker path="palette.secondary.dark" />
              <ColorPicker path="palette.secondary.contrastText" />
              <br />

              <ColorPicker path="palette.error.light" />
              <ColorPicker path="palette.error.main" />
              <ColorPicker path="palette.error.dark" />
              <ColorPicker path="palette.error.contrastText" />
              <br />

              <ColorPicker path="palette.text.primary" />
              <ColorPicker path="palette.text.secondary" />
              <ColorPicker path="palette.text.disabled" />
              <ColorPicker path="palette.text.hint" />
              <br />
            </Panel>

          </Grid>
        </Grid>
      </div>
    )
  }
}

export default ConfigureThemePage

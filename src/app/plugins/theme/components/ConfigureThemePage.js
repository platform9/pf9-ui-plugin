import React from 'react'
import ColorsPanel from './ColorsPanel'
import KitchenSink from './KitchenSink'
import MiscPanel from './MiscPanel'
import TypographyPanel from './TypographyPanel'
import { Grid } from '@material-ui/core'

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
            <ColorsPanel />
            <MiscPanel />
            <TypographyPanel />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default ConfigureThemePage

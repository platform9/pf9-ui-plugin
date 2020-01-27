import React from 'react'
import ColorsPanel from './ColorsPanel'
import ImportExportPanel from './ImportExportPanel'
import KitchenSink from './KitchenSink'
import MiscPanel from './MiscPanel'
// import TypographyPanel from './TypographyPanel'
import { Grid, Typography } from '@material-ui/core'

class ConfigureThemePage extends React.PureComponent {
  render () {
    return (
      <div>
        <Typography variant="h5">Configure Theme</Typography>

        <Grid container spacing={1}>
          <Grid item xs={8}>
            <KitchenSink />
          </Grid>
          <Grid item xs={4}>
            <ImportExportPanel />
            <ColorsPanel />
            <MiscPanel />
            {/* <TypographyPanel /> */}
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default ConfigureThemePage

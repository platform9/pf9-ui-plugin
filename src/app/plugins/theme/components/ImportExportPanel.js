import React from 'react'
import Panel from './Panel'
import ImportDataButton from 'core/components/ImportDataButton'
import ExportDataButton from 'core/components/ExportDataButton'
import { compose } from 'ramda'
import { createMuiTheme } from '@material-ui/core/styles'
import { withAppContext } from 'core/AppContext'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  marginRight: {
    marginRight: theme.spacing.unit * 2,
  }
})

class ImportExportPanel extends React.Component {
  handleImport = themeStr => {
    const themeJson = JSON.parse(themeStr)
    const theme = createMuiTheme(themeJson)
    this.props.setContext({ theme, themeJson })
  }

  render () {
    const { classes, context } = this.props

    return (
      <Panel title="Theme Management">
        <ImportDataButton
          id="import-theme"
          className={classes.marginRight}
          onImport={this.handleImport}
          color="primary"
        >
          Import
        </ImportDataButton>

        <ExportDataButton
          filename="theme.json"
          data={context.theme}
          color="secondary"
        >
          Export
        </ExportDataButton>
      </Panel>
    )
  }
}

export default compose(
  withAppContext,
  withStyles(styles),
)(ImportExportPanel)

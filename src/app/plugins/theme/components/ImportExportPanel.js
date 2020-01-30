import React from 'react'
import Panel from './Panel'
import ImportDataButton from 'core/components/ImportDataButton'
import ExportDataButton from 'core/components/ExportDataButton'
import { compose } from 'ramda'
import { createMuiTheme } from '@material-ui/core/styles'
import { withAppContext } from 'core/providers/AppProvider'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  marginRight: {
    marginRight: theme.spacing(2),
  }
})

class ImportExportPanel extends React.PureComponent {
  handleImport = themeStr => {
    const themeJson = JSON.parse(themeStr)
    const theme = createMuiTheme(themeJson)
    this.props.setContext({ theme, themeJson })
  }

  render () {
    const { classes, theme } = this.props

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
          data={theme}
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

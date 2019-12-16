import React from 'react'
import Panel from './Panel'
import ImportDataButton from 'core/components/ImportDataButton'
import ExportDataButton from 'core/components/ExportDataButton'
import { withStyles } from '@material-ui/styles'
import { connect } from 'react-redux'
import { themeStoreKey, themeActions } from 'core/themes/themeReducers'
import { bindActionCreators } from 'redux'

const styles = theme => ({
  marginRight: {
    marginRight: theme.spacing(2),
  }
})

@connect(
  store => ({ theme: store[themeStoreKey] }),
  dispatch => ({ actions: bindActionCreators(themeActions, dispatch) })
)
class ImportExportPanel extends React.PureComponent {
  handleImport = themeStr => {
    const themeJson = JSON.parse(themeStr)
    this.props.actions.setTheme(themeJson)
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

export default withStyles(styles)(ImportExportPanel)

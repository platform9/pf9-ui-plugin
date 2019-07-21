import React from 'react'
import PropTypes from 'prop-types'
import ApiHelper from 'developer/components/ApiHelper'
import ContextViewer from 'developer/components/ContextViewer'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import SimpleLink from 'core/components/SimpleLink'
import { compose } from 'app/utils/fp'
import { withStyles } from '@material-ui/styles'
import {
  Button, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography,
} from '@material-ui/core'

const styles = theme => ({
  root: {
    marginTop: theme.spacing(4),
    width: '100%',
  },
  panel: {
    width: '100%',
  },
  details: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
})

class DeveloperToolsEmbed extends React.Component {
  state = { expanded: true }

  expand = () => this.setState({ expanded: true })
  collapse = () => this.setState({ expanded: false })

  Panel = ({ title, children }) => (
    <ExpansionPanel className={this.props.classes.panel}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography className={this.props.classes.heading}>{title}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={this.props.classes.details}>{children}</ExpansionPanelDetails>
    </ExpansionPanel>
  )

  render () {
    const {
      props: { enabled, classes },
      state: { expanded },
      Panel,
    } = this

    if (!enabled) { return null }
    if (!expanded) {
      return (
        <div className={classes.root}>
          <Button onClick={this.expand}>expand devtools</Button>
        </div>
      )
    }
    //
    // This is currently UI developers only so leaving always expanded
    return (
      <div className={classes.root}>

        {false && <Button onClick={this.collapse}>collapse devtools</Button>}
        <Typography variant="subtitle1">Developer Tools</Typography>
        <Panel title="Context Viewer">
          <ContextViewer />
        </Panel>
        <Panel title="API helper">
          <ApiHelper />
        </Panel>
        <SimpleLink src="/ui/themes/configure">Theme Manager</SimpleLink>
      </div>
    )
  }
}

DeveloperToolsEmbed.propTypes = {
  enabled: PropTypes.bool,
}

DeveloperToolsEmbed.defaultProps = {
  enabled: true,
}

export default compose(
  withStyles(styles),
)(DeveloperToolsEmbed)

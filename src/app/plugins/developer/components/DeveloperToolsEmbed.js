import React from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { compose } from 'core/../../../utils/fp'
import ContextViewer from 'developer/components/ContextViewer'
import ApiHelper from 'developer/components/ApiHelper'

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 4,
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

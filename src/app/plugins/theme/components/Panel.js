import React from 'react'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import {
  ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography,
} from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  root: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
})

const Panel = withStyles(styles)(({ classes, title, children, titleVariant = 'subtitle1', ...rest }) => (
  <div className={classes.root}>
    <ExpansionPanel defaultExpanded {...rest}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant={titleVariant}>{title}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div style={{ width: '100%' }}>
          {children}
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  </div>
))

export default withStyles(styles)(Panel)

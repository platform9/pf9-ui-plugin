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
  summary: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between'
  },
})

const Panel = withStyles(styles)(({ classes, title, children, link = null, titleVariant = 'subtitle1', ...rest }) => (
  <div className={classes.root}>
    <ExpansionPanel defaultExpanded {...rest}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <div className={classes.summary}>
          <Typography variant={titleVariant}>{title}</Typography>
          { link !== null && link }
        </div>
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

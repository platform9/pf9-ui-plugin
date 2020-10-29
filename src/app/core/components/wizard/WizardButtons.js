import React from 'react'
import { withStyles } from '@material-ui/styles'
import clsx from 'clsx'

const styles = (theme) => ({
  root: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'row',
  },
  callout: {
    marginLeft: 264,
  },
})

const WizardButtons = ({ classes, children, hasCalloutFields = false }) => (
  <div className={clsx(classes.root, hasCalloutFields && classes.callout)}>{children}</div>
)

export default withStyles(styles)(WizardButtons)

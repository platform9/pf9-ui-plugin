import React from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  cardButton: {
    margin: 0,
    borderRadius: 2,
    textTransform: 'uppercase',
    height: 32,
    padding: theme.spacing(0.25, 2),
    color: theme.palette.dashboardCard.primary,
    border: `1px solid ${theme.palette.dashboardCard.primary}`,
    background: theme.palette.dashboardCard.button,
    whiteSpace: 'nowrap',
  }
})

const CardButton = ({ children, classes, ...rest }) => (
  <Button
    className={classes.cardButton}
    variant="contained"
    {...rest}
  >
    + {children}
  </Button>
)

export default withStyles(styles)(CardButton)

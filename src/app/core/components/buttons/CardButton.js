import React from 'react'
import { withStyles } from '@material-ui/styles'
import Button from 'core/elements/button'

const styles = (theme) => ({
  cardButton: {
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
})

const CardButton = ({ children, classes, showPlus = true, ...rest }) => (
  <Button className={classes.cardButton} variant="light" color="secondary" {...rest}>
    {showPlus ? '+' : ''}
    {children}
  </Button>
)

export default withStyles(styles)(CardButton)

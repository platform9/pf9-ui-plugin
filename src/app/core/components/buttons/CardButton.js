import React from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/styles'
import { hexToRGBA } from 'core/utils/colorHelpers'
import { TestId } from 'utils/testId'

const styles = (theme) => ({
  cardButton: {
    margin: 0,
    borderRadius: 2,
    textTransform: 'uppercase',
    height: 32,
    padding: theme.spacing(0.25, 2),
    color: theme.palette.dashboardCard.primary,
    border: `1px solid ${hexToRGBA(theme.palette.primary.main, 0.5)}`,
    background: theme.palette.dashboardCard.button,
    whiteSpace: 'nowrap',

    '&:hover': {
      backgroundColor: hexToRGBA(theme.palette.primary.main, 0.1),
      boxShadow: 'none',
    },
  },
})

const CardButton = ({ children, classes, showPlus = true, ...rest }) => (
  <Button
    data-testid={TestId.TEST_CARD_BUTTON}
    className={classes.cardButton}
    variant="contained"
    {...rest}
  >
    {showPlus && '+'}
    {children}
  </Button>
)

export default withStyles(styles)(CardButton)

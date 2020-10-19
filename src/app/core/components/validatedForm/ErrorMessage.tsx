import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import FontAwesomeIcon from '../FontAwesomeIcon'

const useStyles = makeStyles((theme: Theme) => ({
  errorMessage: {
    color: theme.palette.red[500],
    display: 'grid',
    gridTemplateColumns: '26px auto',
  },
  errorIcon: {
    position: 'relative',
    top: '5px',
  },
}))

export const ErrorMessage = ({ children }) => {
  const classes = useStyles({})

  return children ? (
    <div className={classes.errorMessage}>
      <FontAwesomeIcon className={classes.errorIcon}>exclamation-circle</FontAwesomeIcon>
      <div>{children}</div>
    </div>
  ) : null
}

import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import FontAwesomeIcon from '../FontAwesomeIcon'
import clsx from 'clsx'

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

export const ErrorMessage = ({ className = undefined, children }) => {
  const classes = useStyles({})

  return children ? (
    <div className={clsx(classes.errorMessage, className)}>
      <FontAwesomeIcon className={classes.errorIcon}>exclamation-circle</FontAwesomeIcon>
      <div>{children}</div>
    </div>
  ) : null
}

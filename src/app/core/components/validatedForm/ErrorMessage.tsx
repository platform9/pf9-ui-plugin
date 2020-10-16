import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

const useStyles = makeStyles((theme: Theme) => ({
  errorMessage: {
    color: theme.palette.red[500],
  },
}))

export const ErrorMessage = ({ children }) => {
  const classes = useStyles({})

  return <div className={classes.errorMessage}>{children}</div>
}

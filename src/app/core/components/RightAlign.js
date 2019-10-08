import React from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => createStyles({
  root: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
}))

const RightAlign = ({ children }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {children}
    </div>
  )
}

export default RightAlign

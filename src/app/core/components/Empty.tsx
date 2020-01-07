import React from 'react'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  root: {
    fontSize: '20px',
  }
}))

const Empty: React.FunctionComponent = (): JSX.Element => {
  const classes = useStyles({})
  return <span className={classes.root}>&mdash;</span>
}

export default Empty

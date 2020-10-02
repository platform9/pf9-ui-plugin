import React from 'react'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Button from 'core/elements/button'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    // backgroundColor: '#f3f3f4',
    margin: theme.spacing(0, 1),
    '&:hover': {
      // backgroundColor: '#FFFFFF',
    },
  },
}))

const BannerButton = ({ children, ...rest }) => {
  const classes = useStyles({})
  return (
    <Button className={classes.root} {...rest}>
      {children}
    </Button>
  )
}

export default BannerButton

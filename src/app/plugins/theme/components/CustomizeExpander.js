import React, { useState } from 'react'
import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
  }
}))

const CustomizeExpander = ({ children }) => {
  const classes = useStyles({})
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = () => setExpanded(!expanded)

  const customizeButton = (<Button onClick={toggleExpanded}>customize</Button>)

  const expandedContent = (
    <div>
      <Button onClick={toggleExpanded}>collapse</Button>
      <br />
      {children}
    </div>
  )

  return (
    <div className={classes.root}>
      <br />
      {expanded ? expandedContent : customizeButton}
    </div>
  )
}

export default CustomizeExpander

import React from 'react'
import { Tooltip } from '@material-ui/core'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { makeStyles } from '@material-ui/styles'
import useReactRouter from 'use-react-router'
import { helpUrl } from 'app/constants'

const useStyles = makeStyles(() => ({
  icon: {
    cursor: 'pointer',
    fontWeight: 900,
  },
}))

const HelpContainer = () => {
  const classes = useStyles()
  const { history } = useReactRouter()

  return (
    <Tooltip title="Help" placement="bottom">
      <FontAwesomeIcon className={classes.icon} onClick={() => history.push(helpUrl)}>question-circle</FontAwesomeIcon>
    </Tooltip>
  )
}

export default HelpContainer

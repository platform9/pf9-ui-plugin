// Libs
import React from 'react'
import { makeStyles } from '@material-ui/core'

// Types
import Theme from 'core/themes/model'

// Helpers
import { summaryMessages, detailMessages, getServiceMessage, isSystemHealthy } from './helpers'
import Text from 'core/elements/text'
import { DDUHealth } from 'api-client/model'

interface Props {
  taskState: string
  desiredServices: number
  readyServices: number
  serviceDetails: DDUHealth['service_details']
}

export default function Summary({
  taskState,
  desiredServices,
  readyServices,
  serviceDetails,
}: Props) {
  const classes = useStyles()
  const summaryMessage = summaryMessages[taskState]
  const detailMessage = detailMessages[taskState]
  const isHealthy = isSystemHealthy(taskState, serviceDetails)
  const message = getServiceMessage(desiredServices, readyServices)
  const serviceMessage = isHealthy ? `, ${message}` : ''
  return (
    <header className={classes.header}>
      <Text variant="h3" component="h1">
        {summaryMessage}
      </Text>
      <Text variant="subtitle1" component="p">
        {detailMessage}
        {serviceMessage}
      </Text>
    </header>
  )
}

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  header: {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.grey[200],
    display: 'grid',
    gridTemplateRows: 'max-content max-content',
    alignContent: 'center',
    justifyContent: 'center',
    gridGap: 16,
    textAlign: 'center',
    padding: '0 16px',
  },
}))

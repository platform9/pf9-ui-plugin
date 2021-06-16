import React from 'react'
import { makeStyles } from '@material-ui/core'

// Types
import Theme from 'core/themes/model'
import { ServiceDetail } from 'api-client/model'

// Helpers
import { isServiceHealthy, isSystemResuming } from './helpers'
import { objSwitchCase as objSwitchCaseAny } from 'utils/fp'
import Text from 'core/elements/text'

const objSwitchCase: any = objSwitchCaseAny

interface Props {
  name: string
  details: ServiceDetail
  taskState: string
}

export default function ServiceCard({ name, details, taskState }: Props) {
  const isHealthy = isServiceHealthy(details)
  const isResuming = isSystemResuming(taskState)
  const readyHealth = isResuming ? 'resuming' : isHealthy ? 'success' : 'error'
  const classes = useStyles({ readyHealth })
  return (
    <div className={classes.serviceCard}>
      <Text variant="subtitle1" className={classes.header}>
        {name}
      </Text>
      <div className={classes.statBreakdown}>
        <Text variant="body2">Desired / Ready</Text>
        <Text variant="body1" className={classes.stat}>
          {details?.desired} / {details?.ready}
        </Text>
      </div>
    </div>
  )
}

const useStyles = makeStyles<Theme, { readyHealth: string }>((theme: Theme) => ({
  serviceCard: {
    borderTop: ({ readyHealth }) =>
      `5px solid ${objSwitchCase(
        {
          error: theme.palette.red[500],
          success: theme.palette.green[500],
          resuming: theme.palette.blue[500],
        },
        'transparent',
      )(readyHealth)}`,
    backgroundColor: theme.palette.grey['000'],
    display: 'grid',
    gridTemplateRows: 'max-content max-content',
    borderRadius: '4px',
  },
  header: {
    margin: '0 8px',
    padding: '16px 0',
    textAlign: 'center',
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
  statBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 0',
  },
  stat: {
    fontSize: 19,
    color: theme.palette.grey[900],
  },
}))

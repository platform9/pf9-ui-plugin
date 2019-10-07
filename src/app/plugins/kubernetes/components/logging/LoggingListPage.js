import React from 'react'
import useReactRouter from 'use-react-router'
import { makeStyles, createStyles } from '@material-ui/styles'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import loggingActions from './actions'

const useStyles = makeStyles(theme => createStyles({
  titleAndCreateButton: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  enabledIcon: {
    fontSize: 13,
    fontWeight: 600,
    color: '#4adf74',
  },
  disabledIcon: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e44c34',
  },
  configuringIcon: {
    fontSize: 13,
    fontWeight: 300,
    color: '#606060',
  },
  failedIcon: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e44c34',
  },
}))

const addUrl = '/ui/kubernetes/logging/add'
const editUrl = '/ui/kubernetes/logging/edit'

const status = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  CONFIGURING: 'configuring',
  FAILED: 'failed',
}

const LoggingListPage = () => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const columns = getColumns(classes)
  const batchActions = getActions(classes, history)

  // TODO: onEdit and onDelete
  const options = {
    addText: 'New Logging',
    uniqueIdentifier: 'cluster',
    loaderFn: loggingActions.list,
    onEdit: () => {},
    onDelete: () => {},
    addUrl,
    editUrl,
    columns,
    batchActions,
  }
  const { ListPage } = createCRUDComponents(options)

  return <ListPage />
}

const renderStatus = (classes, value) => {
  let icon
  switch (value) {
    case status.ENABLED:
      icon = (
        <FontAwesomeIcon className={classes.enabledIcon}>
            check
        </FontAwesomeIcon>
      )
      break
    case status.DISABLED:
      icon = (
        <FontAwesomeIcon className={classes.disabledIcon}>
            times
        </FontAwesomeIcon>
      )
      break
    case status.CONFIGURING:
      icon = (
        <FontAwesomeIcon className={classes.configuringIcon}>
            sync
        </FontAwesomeIcon>
      )
      break
    case status.FAILED:
      icon = (
        <FontAwesomeIcon className={classes.failedIcon}>
            exclamation-circle
        </FontAwesomeIcon>
      )
      break
    default:
      icon = (
        <FontAwesomeIcon className={classes.enabledIcon}>
          check
        </FontAwesomeIcon>
      )
  }

  return (
    <span>{icon}{value}</span>
  )
}

const renderList = (values) => values.map(value => (<div>{value}</div>))

const getColumns = (classes) => [
  { id: 'cluster', label: 'Cluster' },
  { id: 'status', label: 'Status', render: (value) => renderStatus(classes, value) },
  { id: 'logStorage', label: 'Log Storage', render: renderList },
  { id: 'logDestination', label: 'Log Destination', render: renderList },
]

const getActions = (classes, history) => [
  {
    icon: 'check',
    label: 'Enable',
    action: () => {},
    cond: (clusters) => clusters.every(cluster => cluster.status === status.DISABLED)
  },
  {
    icon: 'times',
    label: 'Disable',
    action: () => {},
    cond: (clusters) => clusters.every(cluster => cluster.status === status.ENABLED)
  },
]

export default LoggingListPage

import React, { Fragment } from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import Box from '@material-ui/core/Box'
import ListTable from 'core/components/listTable/ListTable'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles(theme => createStyles({
  actionIconWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  actionIcon: {
    fontSize: 18,
    fontWeight: 300,
    color: '#606060',
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

const status = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  CONFIGURING: 'configuring',
  FAILED: 'failed',
}

const storageType = {
  S3: 'AWS-S3',
  ELASTIC_SEARCH: 'ElasticSearch',
}

const data = [
  {
    cluster: 'cluster-id-01',
    status: status.ENABLED,
    logStorage: [
      storageType.S3,
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'bucket123/regionnameABC',
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    cluster: 'cluster-id-02',
    status: status.DISABLED,
    logStorage: [
      storageType.S3,
    ],
    logDestination: [
      'bucket123/regionnameABC',
    ],
  },
  {
    cluster: 'cluster-id-03',
    status: status.ENABLED,
    logStorage: [
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    cluster: 'cluster-id-04',
    status: status.ENABLED,
    logStorage: [
      storageType.S3,
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'bucket123/regionnameABC',
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    cluster: 'cluster-id-05',
    status: status.CONFIGURING,
    logStorage: [
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    cluster: 'cluster-id-06',
    status: status.FAILED,
    logStorage: [
      storageType.S3,
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'bucket123/regionnameABC',
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    cluster: 'cluster-id-07',
    status: status.DISABLED,
    logStorage: [
      storageType.S3,
    ],
    logDestination: [
      'bucket123/regionnameABC',
    ],
  },
  {
    cluster: 'cluster-id-08',
    status: status.ENABLED,
    logStorage: [
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    cluster: 'cluster-id-09',
    status: status.ENABLED,
    logStorage: [
      storageType.S3,
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'bucket123/regionnameABC',
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    cluster: 'cluster-id-10',
    status: status.ENABLED,
    logStorage: [
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'http://mybucket.s3.johnsmith',
    ],
  },
]

const LoggingPage = () => {
  const classes = useStyles()
  const columns = getColumns(classes)
  const actions = getActions(classes)

  return (
    <Fragment>
      <h2>Logging</h2>
      <ListTable columns={columns} data={data} batchActions={actions} />
    </Fragment>
  )
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

const ActionIcon = ({ classes, icon, label }) =>
  <Box className={classes.actionIconWrapper}>
    <FontAwesomeIcon className={classes.actionIcon}>{icon}</FontAwesomeIcon>
    {label}
  </Box>

const getActions = (classes) => [
  {
    icon: <ActionIcon classes={classes} icon='check' label='Enable' />,
    label: 'Enable',
    action: () => {},
    cond: (clusters) => clusters.every(cluster => cluster.status === status.DISABLED)
  },
  {
    icon: <ActionIcon classes={classes} icon='times' label='Disable' />,
    label: 'Disable',
    action: () => {},
    cond: (clusters) => clusters.every(cluster => cluster.status === status.ENABLED)
  },
  {
    icon: <ActionIcon classes={classes} icon='edit' label='Edit' />,
    label: 'Edit',
    action: () => {},
    cond: (clusters) => clusters.length === 1
  },
  {
    icon: <ActionIcon classes={classes} icon='trash-alt' label='Delete' />,
    label: 'Delete',
    action: () => {},
  },
]

export default LoggingPage

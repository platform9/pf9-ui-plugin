import React from 'react'
import CheckIcon from '@material-ui/icons/Check'
import WarningIcon from '@material-ui/icons/Warning'
import { green, yellow, deepOrange } from '@material-ui/core/colors'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'
import { objSwitchCase } from 'utils/fp'
import { capitalizeString } from 'utils/misc'
import ExternalLink from 'core/components/ExternalLink'
import { propOr } from 'ramda'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { Tooltip } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'baseline',
  },
  loading: {
    marginRight: 3,
    marginBottom: 3,
    fontSize: 15,
  },
  supportRole: {
    fontSize: '0.7rem',
    color: 'rgba(0, 0, 0, 0.87)',
    marginTop: 5,
    '& i': {
      fontSize: 'inherit',
    },
  },
}))

const greenStyle = { color: green[500] }
const yellowStyle = { color: yellow[600] }
const orangeStyle = { color: deepOrange[500] }

const isDebian = host => ['ubuntu', 'debian'].includes(propOr('', 'osInfo', host).toLowerCase())
const getTimeDriftSupportLink = host => isDebian(host)
  ? 'https://platform9.com/support/prepare-a-ubuntu-server-for-platform9-openstack/'
  : 'https://platform9.com/support/prepare-a-centos-physical-server/'

const HostStatus = ({ host = {} }) => {
  const classes = useStyles()
  const { uiState = '', warnings, supportRole } = host
  const getStatusContents = objSwitchCase({
    'online': <><CheckIcon style={greenStyle} />Connected</>,

    'offline': <><WarningIcon style={yellowStyle} />Offline since {host.lastResponse}</>,

    'drifted': warnings ? warnings.map(warning =>
      <ExternalLink url={getTimeDriftSupportLink(host)}>
        <WarningIcon style={yellowStyle} />{warning}
      </ExternalLink>) : capitalizeString(uiState),

    'pending': <>
      <i className={clsx(classes.loading, 'fal fa-lg fa-spin fa-sync')} />Discovering</>,

    'error': <><WarningIcon style={orangeStyle} />Error authorizing host. Please contact
      support.</>,

    'invalid-credentials': <><WarningIcon style={orangeStyle} />
      Error connecting to vCenter. Please <a href="#/infrastructure/vmware">update your
        credentials</a>.</>,

    'insufficient-permissions': <>
      <WarningIcon style={yellowStyle} />
      Cannot verify vCenter permissions. Please <a href="#/infrastructure/vmware">ensure you have
      sufficient permissions</a>.
    </>,
  }, uiState ? capitalizeString(uiState) : 'Unknown')

  return <div className={classes.root}>
    {getStatusContents(uiState)}
    {supportRole && <div className={classes.supportRole}>
      (Advanced Remote Support Enabled)&nbsp;
      <Tooltip title={'Advanced Remote Support is currently enabled on this node. To disable it, select the \'Configure Host\' action from the actions bar.'}>
        <FontAwesomeIcon>question-circle</FontAwesomeIcon>
      </Tooltip>
    </div>}
  </div>
}

export default HostStatus

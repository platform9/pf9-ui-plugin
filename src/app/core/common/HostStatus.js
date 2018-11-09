import React from 'react'
import CheckIcon from '@material-ui/icons/Check'
import WarningIcon from '@material-ui/icons/Warning'
import { green, yellow } from '@material-ui/core/colors'

const greenStyle = { color: green[500] }
const yellowStyle = { color: yellow[500] }

const HostStatus = ({ host }) => {
  const uiState = host && host.uiState
  switch (uiState) {
    case 'online':
      return <span><CheckIcon style={greenStyle} /> connected</span>

    case 'offline':
      return <span><WarningIcon style={yellowStyle} /> offline since {host.lastResponse}</span>

    case 'drifted':
    case 'pending':
    case 'error':
    case 'invalid-credentials':
    case 'insufficient-permissions':
      // TODO:
      return `${uiState}`

    default:
      return uiState || 'unknown'
  }

  // TODO: append support role
}

export default HostStatus

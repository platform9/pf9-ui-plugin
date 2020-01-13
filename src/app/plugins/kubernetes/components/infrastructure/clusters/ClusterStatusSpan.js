import { Tooltip } from '@material-ui/core'
import clsx from 'clsx'
import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { objSwitchCase } from 'utils/fp'
import PropTypes from 'prop-types'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    padding: theme.spacing(0.5, 0),
  },
  label: {
    width: 50,
  },
  circle: {
    display: 'inline-flex',
    alignItems: 'center',
    '&:before': {
      content: '\' \'',
      height: 14,
      width: 14,
      marginRight: 3,
      borderRadius: '50%',
      display: ({ status }) => !status || ['loading', 'error'].includes(status) ? 'none' : 'inline-block',
      backgroundColor: ({ status }) => objSwitchCase({
        ok: '#31DA6D',
        pause: '#fec35d',
        fail: '#F16E3F'
      }, '#F16E3F')(status)
    },
  },
  loading: {
    marginRight: theme.spacing(0.375),
    fontSize: 14,
  },
  error: {
    marginRight: theme.spacing(0.375),
    fontSize: 14,
  },
}))

const ClusterStatusSpan = props => {
  const { label, title, children, status } = props
  const { loading, error, circle, label: labelCls, root } = useStyles(props)
  return <div className={root}>
    {label && <span className={labelCls}>{label}:</span>}
    <Tooltip title={title || children}>
      <span className={circle}>
        {status === 'loading' && <i className={clsx(loading, 'fal fa-lg fa-spin fa-sync')} />}
        {status === 'error' && <i className={clsx(error, 'fas fa-exclamation-triangle')} />}
        {children}
      </span>
    </Tooltip>
  </div>
}

ClusterStatusSpan.propTypes = {
  label: PropTypes.string,
  title: PropTypes.string,
  status: PropTypes.oneOf(['ok', 'fail', 'pause', 'loading', 'error'])
}

export default ClusterStatusSpan

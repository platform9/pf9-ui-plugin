import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from '@material-ui/core'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { withAppContext } from 'core/AppProvider'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'
import { ensureFunction } from 'utils/fp'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    cursor: 'pointer',
    lineHeight: 2,
    fontSize: theme.typography.fontSize * 0.8,
  },
  actionIcon: {
    fontWeight: 400,
    minHeight: 20,
    fontSize: '1.7em',
  },
  actionLabel: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    wordWrap: 'break-word',
  },
  disabledAction: {
    cursor: 'not-allowed',
    color: 'rgba(0, 0, 0, .3)',
    '& i': {
      color: 'inherit',
    },
  },
}))

// FIXME this should not be accessing the global context
const ListTableBatchActions = ({ context, batchActions = [], selected = [] }) => {
  const { root, actionLabel, actionIcon, disabledAction } = useStyles()
  if (selected.length === 0 || batchActions.length === 0) { return null }

  const renderAction = action => {
    const isActionEnabled = !action.cond || action.cond(selected, context)
    const info = isActionEnabled || !action.disabledInfo
      ? action.label
      : ensureFunction(action.disabledInfo)(selected)
    return <Tooltip key={action.label} title={info}>
      <div className={clsx(root, {
        [disabledAction]: !isActionEnabled,
      })} onClick={isActionEnabled ? () => action.action(selected, context) : null}>
        {typeof action.icon === 'string'
          ? <FontAwesomeIcon className={actionIcon}>{action.icon}</FontAwesomeIcon>
          : action.icon}
        <div className={actionLabel}>{action.label}</div>
      </div>
    </Tooltip>
  }

  return batchActions.map(renderAction)
}

export const listTableActionPropType = PropTypes.shape({
  label: PropTypes.string.isRequired,
  action: PropTypes.func,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  cond: PropTypes.func,
  disabledInfo: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  dialog: PropTypes.func,  // a React class or function
})

ListTableBatchActions.propTypes = {
  // The selected rows
  selected: PropTypes.arrayOf(PropTypes.object),

  // The actions to perform on the selected rows
  batchActions: PropTypes.arrayOf(listTableActionPropType),
}

export default withAppContext(ListTableBatchActions)

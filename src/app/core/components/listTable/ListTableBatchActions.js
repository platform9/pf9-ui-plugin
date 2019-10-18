import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from '@material-ui/core'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { withAppContext } from 'core/AppProvider'
import { makeStyles } from '@material-ui/styles'

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
}))

// FIXME this should not be accessing the context
const ListTableBatchActions = ({ context, batchActions, selected = [] }) => {
  const { root, actionLabel, actionIcon } = useStyles()
  const filtered = (batchActions || []).filter(action =>
    action.cond === undefined || action.cond(selected, context)
  )
  if (selected.length === 0 || filtered.length === 0) { return null }
  return filtered.map(action => (
    <Tooltip key={action.label} title={action.label}>
      <div className={root} onClick={() => action.action(selected, context)}>
        {typeof action.icon === 'string'
          ? <FontAwesomeIcon className={actionIcon}>{action.icon}</FontAwesomeIcon>
          : action.icon}
        <div className={actionLabel}>{action.label}</div>
      </div>
    </Tooltip>
  ))
}

ListTableBatchActions.propTypes = {
  // The selected rows
  selected: PropTypes.arrayOf(PropTypes.object),

  // The actions to perform on the selected rows
  batchActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.func,
      icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
      cond: PropTypes.func,
    })
  ),
}

export default withAppContext(ListTableBatchActions)

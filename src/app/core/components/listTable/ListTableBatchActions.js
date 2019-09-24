import React from 'react'
import PropTypes from 'prop-types'
import { IconButton, Tooltip } from '@material-ui/core'
import { withAppContext } from 'core/AppProvider'

// FIXME this should not be accessing the context
const ListTableBatchActions = ({ actionClassName, context, batchActions, selected = [] }) => {
  const filtered = (batchActions || []).filter(action =>
    action.cond === undefined || action.cond(selected, context)
  )
  if (selected.length === 0 || filtered.length === 0) { return null }
  return filtered.map(action => (
    <Tooltip key={action.label} title={action.label}>
      <IconButton className={actionClassName} onClick={() => action.action(selected, context)}>{action.icon}</IconButton>
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
      icon: PropTypes.node,
      cond: PropTypes.func,
    })
  ),
}

export default withAppContext(ListTableBatchActions)

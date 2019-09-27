import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from '@material-ui/core'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { withAppContext } from 'core/AppProvider'

// FIXME this should not be accessing the context
const ListTableBatchActions = ({ actionClassName, actionIconClassName, context, batchActions, selected = [] }) => {
  const filtered = (batchActions || []).filter(action =>
    action.cond === undefined || action.cond(selected, context)
  )
  if (selected.length === 0 || filtered.length === 0) { return null }
  return filtered.map(action => (
    <Tooltip key={action.label} title={action.label}>
      <div className={actionClassName} onClick={() => action.action(selected, context)}>
        <FontAwesomeIcon className={actionIconClassName}>{action.icon}</FontAwesomeIcon>
        {action.label}
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
      icon: PropTypes.string,
      cond: PropTypes.func,
    })
  ),
}

export default withAppContext(ListTableBatchActions)

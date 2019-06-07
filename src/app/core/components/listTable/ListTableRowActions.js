import React from 'react'
import PropTypes from 'prop-types'
import { IconButton, Tooltip } from '@material-ui/core'
import { withAppContext } from 'core/AppContext'

const ListTableRowActions = ({ actionClassName, context, rowActions, selected }) => {
  const _selected = selected || []
  const filtered = (rowActions || []).filter(action =>
    action.cond === undefined || action.cond(_selected, context)
  )
  if (_selected.length === 0 || filtered.length === 0) { return null }
  return filtered.map(action => (
    <Tooltip key={action.label} title={action.label}>
      <IconButton className={actionClassName} onClick={() => action.action(_selected, context)}>{action.icon}</IconButton>
    </Tooltip>
  ))
}

ListTableRowActions.propTypes = {
  // The selected rows
  selected: PropTypes.arrayOf(PropTypes.object),

  // The actions to perform on the selected rows
  rowActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.func,
      icon: PropTypes.node,
      cond: PropTypes.func,
    })
  ),
}

export default withAppContext(ListTableRowActions)

import React, { useState, Fragment, useContext } from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from '@material-ui/core'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'
import { ensureFunction } from 'utils/fp'
import { AppContext } from 'core/providers/AppProvider'
import { withRouter } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 50,
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    marginTop: theme.spacing(1),
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

const ListTableAction = withRouter(({ cond, action, label, disabledInfo, dialog, icon, selected, onRefresh, routeTo, history }) => {
  const { root, actionLabel, actionIcon, disabledAction } = useStyles()
  const [dialogOpened, setDialogOpened] = useState(false)
  const { getContext } = useContext(AppContext)
  const isActionEnabled = !cond || cond(selected, getContext)
  const info = isActionEnabled || !disabledInfo
    ? label
    : ensureFunction(disabledInfo)(selected)
  const DialogComponent = dialog
  return <Fragment>
    {dialog && dialogOpened
      ? <DialogComponent rows={selected} open={dialogOpened} onClose={success => {
        if (success && onRefresh) {
          onRefresh()
        }
        setDialogOpened(false)
      }} />
      : null}
    <Tooltip key={label} title={info}>
      <div className={clsx(root, {
        [disabledAction]: !isActionEnabled,
      })} onClick={isActionEnabled ? () => {
        if (dialog) { setDialogOpened(true) }
        if (action) { action(selected) }
        if (routeTo) {
          history.push(routeTo(selected))
        }
      } : null}>
        {typeof icon === 'string'
          ? <FontAwesomeIcon className={actionIcon}>{icon}</FontAwesomeIcon>
          : icon}
        <div className={actionLabel}>{label}</div>
      </div>
    </Tooltip></Fragment>
})

const ListTableBatchActions = ({ batchActions = [], selected = [], onRefresh }) => {
  if (selected.length === 0 || batchActions.length === 0) { return null }
  return batchActions.map(action =>
    <ListTableAction key={action.label} {...action} onRefresh={onRefresh} selected={selected} />)
}

export const listTableActionPropType = PropTypes.shape({
  label: PropTypes.string.isRequired,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  cond: PropTypes.func,
  disabledInfo: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),

  // When clicking one of the batch action icons you can specify the logic as a dialog, route, or arbitrary function.
  // Only one of these should be used at a time.
  dialog: PropTypes.func,  // a React class or function
  routeTo: PropTypes.func,
  action: PropTypes.func,
})

ListTableBatchActions.propTypes = {
  // The selected rows
  selected: PropTypes.arrayOf(PropTypes.object),

  // The actions to perform on the selected rows
  batchActions: PropTypes.arrayOf(listTableActionPropType),

  onRefresh: PropTypes.func,
}

export default ListTableBatchActions

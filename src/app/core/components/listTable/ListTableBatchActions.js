import React, { useState, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from '@material-ui/core'
import { useSelector } from 'react-redux'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'
import { identity } from 'ramda'
import { ensureFunction } from 'utils/fp'
import { withRouter } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 34,
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    cursor: 'pointer',
    position: 'relative',
    bottom: -2,
    ...theme.typography.caption3,
  },
  actionIcon: {
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& i': {
      fontSize: 22,
    },
  },
  actionLabel: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    wordWrap: 'break-word',
    marginTop: 2,
  },
  disabledAction: {
    cursor: 'not-allowed',
    color: theme.palette.grey[300],
    '& i': {
      color: 'inherit',
    },
  },
}))

export const ToolbarActionIcon = ({ icon }) => {
  const classes = useStyles()
  return (
    <div className={classes.actionIcon}>
      <FontAwesomeIcon>{icon}</FontAwesomeIcon>
    </div>
  )
}

const ListTableAction = withRouter(
  ({ cond, action, label, disabledInfo, dialog, icon, selected, onRefresh, routeTo, history }) => {
    const { root, actionLabel, disabledAction } = useStyles()
    const [dialogOpened, setDialogOpened] = useState(false)
    const store = useSelector(identity)
    const isActionEnabled = selected.length && (!cond || cond(selected, store))
    const info = isActionEnabled || !disabledInfo ? label : ensureFunction(disabledInfo)(selected)
    const DialogComponent = dialog
    return (
      <Fragment>
        {dialog && dialogOpened ? (
          <DialogComponent
            rows={selected}
            open={dialogOpened}
            onClose={(success) => {
              if (success === true && onRefresh) {
                onRefresh()
              }
              setDialogOpened(false)
            }}
          />
        ) : null}
        <Tooltip key={label} title={selected.length ? info : ''}>
          <div
            className={clsx(root, {
              [disabledAction]: !isActionEnabled,
            })}
            onClick={
              isActionEnabled
                ? () => {
                    if (dialog) {
                      setDialogOpened(true)
                    }
                    if (action) {
                      action(selected)
                    }
                    if (routeTo) {
                      history.push(routeTo(selected))
                    }
                  }
                : null
            }
          >
            {typeof icon === 'string' ? <ToolbarActionIcon icon={icon} /> : icon}
            <div className={actionLabel}>{label}</div>
          </div>
        </Tooltip>
      </Fragment>
    )
  },
)

const ListTableBatchActions = ({ batchActions = [], selected = [], onRefresh }) => {
  return batchActions.map((action) => (
    <ListTableAction key={action.label} {...action} onRefresh={onRefresh} selected={selected} />
  ))
}

export const listTableActionPropType = PropTypes.shape({
  label: PropTypes.string.isRequired,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  cond: PropTypes.func,
  disabledInfo: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),

  // When clicking one of the batch action icons you can specify the logic as a dialog, route, or arbitrary function.
  // Only one of these should be used at a time.
  dialog: PropTypes.func, // a React class or function
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

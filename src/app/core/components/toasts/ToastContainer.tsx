import React, { FunctionComponent } from 'react'
import { Snackbar, Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import ToastItem, { MessageTypes } from 'core/components/toasts/ToastItem'

const useStyles = makeStyles<Theme>(theme => ({
  root: {
    marginBottom: 80,
    maxWidth: 600,
    // Intercom uses a ridiculously high zIndex so we have to be even more ridiculous
    zIndex: 9999999999,
    display: 'flex',
    flexFlow: 'column nowrap',
    position: 'absolute',
    right: theme.spacing(1),
    bottom: theme.spacing(1)
  },
  toastItem: {
    position: 'relative',
    margin: theme.spacing(1, 0)
  }
}))

export interface ToastOptions {
  id: string
  text: string
  variant: MessageTypes
  isOpen: boolean
  onClose: () => void
}

interface ToastContainerProps {
  toasts: ToastOptions[]
  toastsTimeout: number
}

const ToastContainer: FunctionComponent<ToastContainerProps> = ({ toasts, toastsTimeout }) => {
  const classes = useStyles({})
  return <div className={classes.root}>
    {toasts.map(({ id, isOpen, text, onClose, variant }) =>
      <Snackbar
        className={classes.toastItem}
        key={id}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={isOpen}
        autoHideDuration={toastsTimeout}
      >
        <ToastItem onClose={onClose} variant={variant} message={text} toastsTimeout={toastsTimeout} />
      </Snackbar>)}
  </div>
}

export default ToastContainer

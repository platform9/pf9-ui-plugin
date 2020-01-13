import React, { FunctionComponent } from 'react'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
// import BannerItem from 'core/components/toasts/BannerItem'

import { MessageOptions } from './model'

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

export interface BannerOptions extends MessageOptions {
  dismissable: boolean
}

interface BannerContainerProps {
  toasts: BannerOptions[]
  toastsTimeout: number
}

const BannerContainer: FunctionComponent<BannerContainerProps> = ({ toasts }) => {
  const classes = useStyles({})
  return <div className={classes.root}>
    {toasts.map(({ id, isOpen, text, onClose, variant }) =>
      // <BannerItem />
      <div />
    )}
  </div>
}

export default BannerContainer

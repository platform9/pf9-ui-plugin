import React, { FunctionComponent, useContext } from 'react'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import BannerItem from 'core/components/notifications/BannerItem'
import { BannerContext } from 'core/providers/BannerProvider'

const useStyles = makeStyles<Theme>(theme => ({
  root: {
    // Intercom uses a ridiculously high zIndex so we have to be even more ridiculous
    zIndex: 9999999999,
    display: 'flex',
    flexFlow: 'column nowrap',
    position: 'fixed',
    top: 55,
    left: 0,
    right: 0,
  },
}))

const BannerContainer: FunctionComponent = () => {
  const classes = useStyles({})
  const { banners } = useContext(BannerContext)
  return <div className={classes.root}>
    {banners.map(({ id, content, onClose, variant }) =>
      <BannerItem key={id} variant={variant} onClose={onClose}>{content}</BannerItem>,
    )}
  </div>
}

export default BannerContainer

import React, { FC, useEffect } from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import { BannerContext } from 'core/providers/BannerProvider'

const useStyles = makeStyles<Theme>(theme => ({
  root: {
    // Intercom uses a ridiculously high zIndex so we have to be even more ridiculous
    zIndex: 9999999998,
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    top: 55,
    left: 0,
    right: 0,
    minHeight: 30,
    padding: theme.spacing(2, 4),
    color: theme.palette.secondary.contrastText,
    backgroundColor: '#F5A623',
  },
}))

const bannerContainerRef = React.createRef<HTMLDivElement>()

const BannerContainer: FC = props => {
  const classes = useStyles(props)
  const { setBannerContainer } = React.useContext(BannerContext)

  useEffect(() => {
    // We must set the bannerContainer element ref in the state when the component is mounted
    // so that it is correctly updated and reflected in the BannerContent consumers
    setBannerContainer(bannerContainerRef.current)
  }, [])

  return <div className={classes.root} ref={bannerContainerRef} />
}

export default BannerContainer

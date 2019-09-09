import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import TenantChooser from 'openstack/components/tenants/TenantChooser'
import RegionChooser from 'openstack/components/regions/RegionChooser'
import UserMenu from 'core/components/UserMenu'
import MaterialToolbar from '@material-ui/core/Toolbar/Toolbar'
import { AppBar } from '@material-ui/core'
import { imageUrls } from 'app/constants'
import { withStyles } from '@material-ui/styles'
import { AppContext } from 'core/AppProvider'
import { assoc, dissoc } from 'ramda'

const styles = theme => ({
  appBar: {
    position: 'fixed',
    boxShadow: 'none',
  },
  menuButton: {
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1),
  },
  hide: {
    display: 'none',
  },
  logo: {
    marginLeft: 45,
    height: '100%',
  },
  rightTools: {
    position: 'absolute',
    right: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '700px',
  },
  leftMargin: {
    marginLeft: theme.spacing(2),
  },
  extraContent: {
    position: 'absolute',
    color: theme.palette.text.primary,
    right: theme.spacing(3),
    bottom: -(theme.spacing(9.5)),
  },
})

const extraContentRef = React.createRef()

const renderExtraContent = classes => {
  const { setContext } = React.useContext(AppContext)
  useEffect(() => {
    setContext(assoc('extraContentRef', extraContentRef))
    return () => {
      setContext(dissoc('extraContentRef'))
    }
  }, [])
  return <div className={classes.extraContent} ref={extraContentRef} />
}

const Toolbar = ({ classes, open }) => (
  <AppBar className={classes.appBar}>
    <MaterialToolbar variant="dense" disableGutters={!open}>
      <img src={imageUrls.logo} className={classes.logo} />
      <div className={classes.rightTools}>
        <RegionChooser />
        <TenantChooser className={classes.leftMargin} />
        <UserMenu className={classes.leftMargin} />
      </div>
    </MaterialToolbar>
    {renderExtraContent(classes)}
  </AppBar>

)

Toolbar.propTypes = {
  open: PropTypes.bool,
}

export default withStyles(styles, { withTheme: true })(Toolbar)

import axios from 'axios'

import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import clsx from 'clsx'
import Intercom from 'core/components/integrations/Intercom'
import Navbar, { drawerWidth } from 'core/components/Navbar'
import Toolbar from 'core/components/Toolbar'

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  appFrame: {
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  content: {
    overflowX: 'auto',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'contentShift-left': {
    marginLeft: 0,
  },
  'contentShift-right': {
    marginRight: 0,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
})

@withStyles(styles, { withTheme: true })
class AppContainer extends React.Component {
  async componentDidMount () {
    // Note: urlOrigin may or may not be changed to use a specific path instead of
    // window.location.origin, this depends on whether the new UI is intended to be
    // accessed from the master DU or from each region.
    const urlOrigin = window.location.origin
    // Timestamp tag used for preventing browser caching of features.json
    const timestamp = new Date().getTime()
    try {
      const response = await axios.get(`${urlOrigin}/clarity/features.json?tag=${timestamp}`)
      this.setState({ withStackSlider: !!response.data.experimental.openstackEnabled })
    } catch (err) {
      console.error('No features.json')
      // Just set slider to true for now as a default.
      // This is fine from the old UI perspective because if routed to the
      // dashboard (which is what happens today), the old UI can handle
      // the stack switching appropriately.
      this.setState({ withStackSlider: true })
    }
  }

  state = {
    open: true,
  }

  handleDrawerOpen = () => {
    this.setState({ open: true })
  }

  handleDrawerClose = () => {
    this.setState({ open: false })
  }

  render () {
    const { classes, sections } = this.props
    const { open, withStackSlider } = this.state

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <Toolbar
            handleDrawerOpen={this.handleDrawerOpen}
            open={open} />
          <Navbar
            withStackSlider={withStackSlider}
            drawerWidth={drawerWidth}
            sections={sections}
            open={open}
            handleDrawerClose={this.handleDrawerClose} />
          <main className={clsx(classes.content, classes['content-left'], {
            [classes.contentShift]: open,
            [classes['contentShift-left']]: open,
          })}>
            <div className={classes.drawerHeader} />
            <div>{this.props.children}</div>
          </main>
        </div>
        <Intercom />
      </div>
    )
  }
}

AppContainer.propTypes = {
  classes: PropTypes.object,
  sections: Navbar.propTypes.sections
}

export default AppContainer

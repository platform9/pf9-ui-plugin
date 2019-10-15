import axios from 'axios'

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { withRouter } from 'react-router-dom'
import clsx from 'clsx'
import Intercom from 'core/components/integrations/Intercom'
import Navbar, { drawerWidth } from 'core/components/Navbar'
import Toolbar from 'core/components/Toolbar'
import track from 'utils/tracking'

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

@withRouter
@withStyles(styles, { withTheme: true })
class AppContainer extends PureComponent {
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

  componentWillMount () {
    const { history } = this.props

    this.unlisten = this.props.history.listen((location, action) => {
      track('pageLoad', { route: `${location.pathname}${location.hash}` })
    })

    // This is to send page event for the first page the user lands on
    track('pageLoad', { route: `${history.location.pathname}${history.location.hash}` })
  }

  componentWillUnmount () {
    this.unlisten()
  }

  state = {
    open: true,
  }

  handleDrawerToggle = () => {
    this.setState({ open: !this.state.open })
  }

  render () {
    const { classes, sections } = this.props
    const { open, withStackSlider } = this.state

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <Toolbar />
          <Navbar
            withStackSlider={withStackSlider}
            drawerWidth={drawerWidth}
            sections={sections}
            open={open}
            handleDrawerToggle={this.handleDrawerToggle} />
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

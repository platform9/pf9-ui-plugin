import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import Navbar, { drawerWidth } from 'core/common/Navbar'
import Toolbar from 'core/common/Toolbar'

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
    maxWidth: 'calc(100% - 48px)',
    overflowX: 'auto',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  'content-left': {
    marginLeft: -drawerWidth,
  },
  'content-right': {
    marginRight: -drawerWidth,
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
    const { open } = this.state

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <Toolbar
            handleDrawerOpen={this.handleDrawerOpen}
            open={open} />
          <Navbar
            withSearchBar
            drawerWidth={drawerWidth}
            sections={sections}
            open={open}
            handleDrawerClose={this.handleDrawerClose} />
          <main className={classNames(classes.content, classes['content-left'], {
            [classes.contentShift]: open,
            [classes['contentShift-left']]: open,
          })}>
            <div className={classes.drawerHeader} />
            <div>{this.props.children}</div>
          </main>
        </div>
      </div>
    )
  }
}

AppContainer.propTypes = {
  classes: PropTypes.object,
  sections: Navbar.propTypes.sections
}

export default AppContainer

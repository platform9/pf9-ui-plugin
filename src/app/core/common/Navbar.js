import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { withRouter } from 'react-router'
import { rootPath } from '../globals'
import classNames from 'classnames'
import Avatar from './Avatar'
import Selector from './Selector'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import TenantChooser from 'openstack/components/tenants/TenantChooser'
import { fade } from '@material-ui/core/styles/colorManipulator'
import { except } from 'app/core/fp'
import {
  AppBar,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Toolbar,
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import moize from 'moize'
import { flatten } from 'ramda'
import { withHotKeys } from 'core/common/HotKeysProvider'

const drawerWidth = 240

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
  appBar: {
    position: 'absolute',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'appBarShift-left': {
    marginLeft: drawerWidth,
  },
  'appBarShift-right': {
    marginRight: drawerWidth,
  },
  menuButton: {
    marginLeft: theme.spacing.unit * 1.5,
    marginRight: theme.spacing.unit
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
    height: '100%',
    minHeight: '100vh',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
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
  logo: {
    maxHeight: theme.spacing.unit * 6.5
  },
  rightTools: {
    position: 'absolute',
    right: theme.spacing.unit * 2,
    display: 'flex',
    alignItems: 'center'
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.background.paper, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.background.default, 0.25),
    },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    marginTop: theme.spacing.unit,
  },
  searchIcon: {
    width: theme.spacing.unit * 8,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 8,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
})

@withStyles(styles, { withTheme: true })
@withRouter
@withHotKeys
class Navbar extends React.Component {
  constructor (props) {
    super(props)
    this.searchInputRef = React.createRef()
    props.setHotKeyHandler('f', this.focusSearch, {
      ctrlKey: false
    })
  }

  focusSearch = () => {
    if (this.searchInputRef.current) {
      this.searchInputRef.current.focus()
    }
  }

  state = {
    open: true,
    anchor: 'left',
    curRegion: '',
    regionSearch: '',
    expandedItems: [],
    filterText: '',
  }

  handleDrawerOpen = () => {
    this.setState({ open: true })
  }

  handleDrawerClose = () => {
    this.setState({ open: false })
  }

  handleClick = moize(key => event => {
    this.setState({
      [key]: event.target.innerText
    })
  })

  handleSearch = moize(key => value => {
    this.setState({
      [key]: value
    })
  })

  navTo = moize(link => () => {
    this.props.history.push(link)
  })

  toggleFolding = moize(name => () => {
    this.setState(
      ({ expandedItems, ...state }) => ({
        ...state,
        expandedItems: expandedItems.includes(name)
          ? except(name, expandedItems)
          : [name, ...expandedItems]
      })
    )
  })

  renderNavFolder = (name, links, icon) => {
    const expanded = this.state.expandedItems.includes(name)
    return [
      <MenuItem onClick={this.toggleFolding(name)} key={name}>
        {icon && (
          <ListItemIcon>
            {icon}
          </ListItemIcon>
        )}
        <ListItemText primary={name} />
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </MenuItem>,
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <MenuList component="div" disablePadding>
          {links.map(this.renderNavLink)}
        </MenuList>
      </Collapse>
    ]
  }

  renderNavLink = ({ nestedLinks, link, name, icon }) => {
    return nestedLinks ? (
      this.renderNavFolder(name, nestedLinks, icon)
    ) : (
      <MenuItem onClick={this.navTo(link.path)} key={link.path}>
        {icon && (
          <ListItemIcon>
            {icon}
          </ListItemIcon>
        )}
        <ListItemText primary={name} />
      </MenuItem>
    )
  }

  handleFilterChange = e => {
    const { value } = e.target
    this.setState(prevState => ({...prevState, filterText: value}))
  }

  renderNavFilterBar = () => {
    const { classes } = this.props
    const { filterText } = this.state
    return <div className={classes.search}>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>
      <InputBase
        inputRef={this.searchInputRef}
        value={filterText}
        placeholder="Search…"
        onChange={this.handleFilterChange}
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
      />
    </div>
  }

  flattenLinks = moize(links =>
    flatten(
      links.map(link => link.nestedLinks
        ? this.flattenLinks(link.nestedLinks)
        : [link]))
  )

  getFilteredLinks = filterText => {
    return this.flattenLinks(this.props.links).filter(({name}) =>
      name.includes(filterText)
    )
  }

  render () {
    const { classes, links, withSearchBar } = this.props
    const { open, curRegion, regionSearch, filterText } = this.state
    const logoPath = rootPath + 'images/logo.png'

    const drawer = (
      <Drawer
        variant="persistent"
        classes={{ paper: classes.drawerPaper }}
        anchor="left"
        open={open}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={this.handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <MenuList
          component="nav"
          subheader={withSearchBar ? this.renderNavFilterBar() : null}
        >
          {(filterText
            ? this.getFilteredLinks(filterText)
            : links
          ).map(this.renderNavLink)}
        </MenuList>
      </Drawer>
    )

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open,
              [classes['appBarShift-left']]: open,
            })}
          >
            <Toolbar disableGutters={!open}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <img src={logoPath} className={classes.logo} align="middle" />
              <div className={classes.rightTools}>
                <Selector
                  name={curRegion.length === 0 ? 'Current Region' : curRegion}
                  list={[`AWS-US-West-1-Test`, `KVM-Neutron`]}
                  onChoose={this.handleClick('curRegion')}
                  onSearchChange={this.handleSearch('regionSearch')}
                  searchTerm={regionSearch}
                />
                <TenantChooser />
                <Avatar />
              </div>
            </Toolbar>
          </AppBar>
          {drawer}
          <main
            className={classNames(classes.content, classes['content-left'], {
              [classes.contentShift]: open,
              [classes['contentShift-left']]: open,
            })}
          >
            <div className={classes.drawerHeader} />
            <div>{this.props.children}</div>
          </main>
        </div>
      </div>
    )
  }
}

const linkPropType = {
  name: PropTypes.string,
  link: PropTypes.shape({
    path: PropTypes.string
  }),
  icon: PropTypes.element
}

Navbar.propTypes = {
  withSearchBar: PropTypes.bool,
  classes: PropTypes.object,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      ...linkPropType,
      nestedLinks: PropTypes.arrayOf(PropTypes.shape(linkPropType))
    })
  )
}

export default Navbar

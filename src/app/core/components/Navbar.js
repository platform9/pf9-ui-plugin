import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  Collapse, Drawer, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary,
  IconButton, ListItemText, MenuItem, MenuList, Typography,
} from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { except } from 'app/utils/fp'
import clsx from 'clsx'
import { withHotKeys } from 'core/providers/HotKeysProvider'
import moize from 'moize'
import { assoc, flatten, pluck, prop, propEq, propOr, where, equals } from 'ramda'
import { matchPath, withRouter } from 'react-router'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { imageUrls, clarityDashboardUrl } from 'app/constants'
import { routes } from 'core/utils/routes'

export const drawerWidth = 180

const styles = theme => ({
  logoTitle: {
    backgroundImage: `url(${imageUrls.logo})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 180,
    height: 20,
    backgroundPosition: '-55px -12px',
  },
  logo: {
    justifySelf: 'center',
    maxHeight: 45,
    backgroundImage: `url(${imageUrls.logoBlue})`,
    backgroundRepeat: 'no-repeat',
    transition: `width ${theme.transitions.duration.enteringScreen}ms ease`,
    width: 40,
    backgroundSize: 115,
    height: 24,
    backgroundPosition: 'center -6px',
  },
  logoOpen: {
    width: drawerWidth,
  },
  logoClose: {
    width: 168,
  },
  drawer: {
    zIndex: 1200,
    position: 'relative',
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    height: '100%',
    minHeight: '100vh',
    backgroundColor: theme.palette.sidebar.background,
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: (theme.spacing(6)) + 2,
    // [theme.breakpoints.up('sm')]: {
    //   width: theme.spacing(5.5),
    // },
  },
  paper: {
    // marginTop: 55,
    backgroundColor: 'inherit',
    overflow: 'hidden',
    borderRight: 0,
  },
  drawerHeader: {
    display: 'grid',
    gridTemplateColumns: '50px 1fr',
    height: 55,
    position: 'relative',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: theme.palette.header.background,
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    fontSize: theme.typography.fontSize * 1.2,
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(6),
    transition: theme.transitions.create('width'),
    width: '100%',
  },
  nav: {
    margin: 0,
  },
  activeNavItem: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.sidebar.activeText,
  },
  currentNavLink: {
    backgroundColor: [theme.palette.background.default, '!important'],
    color: [theme.palette.sidebar.activeText, '!important'],

    '&:hover *': {
      color: [theme.palette.sidebar.hoverText, '!important'],
    },
  },
  navHeading: {
    backgroundColor: theme.palette.grey[50],
    paddingTop: 0,
    paddingRight: theme.spacing(1),
    paddingBottom: 0,
    paddingLeft: theme.spacing(1),
  },
  navHeadingText: {
    ...theme.typography.subtitle2,
    padding: 0,
  },
  navBody: {
    padding: 0,
  },
  navIcon: {
    minWidth: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > i': {
      maxHeight: 28,
      maxWidth: 28,
    }
  },
  navMenu: {
    padding: 0,
    width: '100%',
  },
  navMenuItem: {
    display: 'grid',
    gridTemplateColumns: '50px 1fr',
    padding: 0,
    minHeight: theme.spacing(6),
    backgroundColor: theme.palette.sidebar.background,
    color: theme.palette.sidebar.text,

    transition: 'background .2s ease',

    '& i, & span': {
      transition: 'color .2s ease',
    },
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
    },
    '&:hover *': {
      color: theme.palette.sidebar.hoverText, // override child color styles
    },
    borderTop: '2px solid transparent',
    borderBottom: '2px solid transparent',
  },
  navMenuTextRoot: {
    flexGrow: 1,
    padding: theme.spacing(0, 0.5, 0, 1),
    whiteSpace: 'normal',
    margin: 0,
  },
  navMenuText: {
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.sidebar.text,
  },
  toggleButton: {
    background: theme.palette.header.background,
    borderRadius: 0,
    color: theme.palette.primary.contrastText,
    fontSize: 12,
    fontWeight: 500,
    textAlign: 'center',
    padding: theme.spacing(0.5),
    position: 'absolute',
    top: theme.spacing(),
    left: '100%',
    zIndex: 1200,
    width: 27,
    height: 39,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  currentNavMenuText: {
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.sidebar.activeText,
  },
  navMenuList: {
    borderLeft: `${theme.spacing(1)}px solid #6dc6fe`,
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    marginTop: '10px',
  },
  sliderLogo: {
    flexGrow: 1,
    textAlign: 'center',
    background: 'white',
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'center',
    height: '45px',
    // maxWidth: '90%',
    margin: '2px',
    padding: '0 7px',
    borderRadius: theme.shape.borderRadius,
    boxSizing: 'border-box',
    backgroundRepeat: 'no-repeat',
    backgroundImage: ({ stack }) => stack === 'openstack'
      ? 'url(/ui/images/logo-sidenav-os.svg)'
      : 'url(/ui/images/logo-kubernetes-h.png)',
    backgroundSize: ({ open, stack }) => {
      if (stack === 'kubernetes') {
        return open ? '120px' : '130px'
      } else if (stack === 'openstack') {
        return open ? '120px' : '175px'
      }
    },
    backgroundPosition: ({ open, stack }) => {
      if (stack === 'kubernetes') {
        return open ? '7px center' : '9px center'
      } else if (stack === 'openstack') {
        return open ? '10px center' : '7px center'
      }
    },
  },
  sliderLogoImage: {
    maxHeight: 26,
    maxWidth: 130,
  },
  sliderArrow: {
    width: '0.8em',
    color: theme.palette.sidebar.text,
  },
})

@withStyles(styles, { withTheme: true })
@withHotKeys
@withRouter
class Navbar extends PureComponent {
  constructor (props) {
    super(props)
    // The following events will be triggered even when focusing an editable input
    props.setHotKeyHandler('Enter', this.handleEnterKey, { whileEditing: true })
    props.setHotKeyHandler('ArrowUp', this.handleArrowKeys('ArrowUp'), { whileEditing: true })
    props.setHotKeyHandler('ArrowDown', this.handleArrowKeys('ArrowDown'), { whileEditing: true })
    props.setHotKeyHandler('Escape', this.handleEscKey, { whileEditing: true })
  }

  state = {
    expandedSection: null,
    anchor: 'left',
    expandedItems: [],
    activeNavItem: null,
    filterText: '',
  }

  handleLogoClick = () => {
    this.props.history.push(routes.dashboard.path())
  }

  handleEscKey = () => {
    this.setState(prevState => ({
      ...prevState,
      activeNavItem: null,
      filterText: '',
    }))
  }

  handleArrowKeys = direction => () => {
    const { filterText, activeNavItem } = this.state
    if (filterText && activeNavItem) {
      // Highlight next nav item
      const offset = direction === 'ArrowDown' ? 1 : -1
      const sectionLinks = this.getSectionLinks()
      const currentIdx = sectionLinks.findIndex(propEq('name', activeNavItem))
      const nextIdx = (sectionLinks.length + offset + currentIdx) % sectionLinks.length
      const { name: nextLinkName } = sectionLinks[nextIdx]

      this.setState(assoc('activeNavItem', nextLinkName))
    }
  }

  handleEnterKey = () => {
    const { filterText, activeNavItem } = this.state
    if (filterText && activeNavItem) {
      const sectionLinks = this.getSectionLinks()
      const { link: activeNavLink } = sectionLinks.find(propEq('name', activeNavItem))
      this.setState(prevState => ({
        ...prevState,
        activeNavItem: null,
        filterText: '',
      }), () => this.props.history.push(activeNavLink.path))
    }
  }

  handleExpand = moize(sectionName =>
    () => this.setState(assoc('expandedSection', sectionName)))

  handleFilterChange = e => {
    const { value } = e.target
    this.setState(assoc('filterText', value), () => {
      if (value) {
        // Highlight first filtered nav link
        const [{ name } = {}] = this.getSectionLinks()
        this.setState(assoc('activeNavItem', name))
      } else {
        this.setState(assoc('activeNavItem', null))
      }
    })
  }

  flattenLinks = moize(links =>
    flatten(
      links.map(link => link.nestedLinks
        ? this.flattenLinks(link.nestedLinks)
        : [link])),
  )

  getFilteredLinks = links => {
    const { filterText } = this.state
    return this.flattenLinks(links).filter(({ name }) =>
      name.toLocaleLowerCase().includes(filterText.toLocaleLowerCase()),
    )
  }

  getSectionLinks = () => {
    const sectionLinks = flatten(pluck('links', this.props.sections))
    return this.getFilteredLinks(sectionLinks)
  }

  getNavToFn = moize(link => () => {
    this.props.history.push(link)
  })

  toggleFoldingAndNavTo = moize((name, path) => () => {
    this.setState(
      ({ expandedItems, ...state }) => ({
        ...state,
        expandedItems: expandedItems.includes(name)
          ? except(name, expandedItems)
          : [name, ...expandedItems],
      }), () => {
        if (path) {
          this.props.history.push(path)
        }
      },
    )
  })

  renderNavFolder = (name, link, subLinks, icon) => {
    const { classes, location: { pathname, hash }, open } = this.props
    const matchesCurrentPath = link => link && matchPath(`${pathname}${hash}`, {
      path: link.path,
      exact: true,
      strict: false,
    })
    const redirect = () => { window.location = link.path }
    const handleClick = link.external
      ? redirect
      : this.toggleFoldingAndNavTo(name, prop('path', link))
    const isCurrentNavLink = matchesCurrentPath(link)
    const expanded = open && (subLinks.some(({ link }) => matchesCurrentPath(link)) ||
      this.state.expandedItems.includes(name))
    return [
      <MenuItem
        key={`menuItem-${name}`}
        onClick={handleClick}
        className={clsx(classes.navMenuItem, {
          [classes.currentNavLink]: !!isCurrentNavLink,
        })}>
        {icon && <div className={classes.navIcon}>
          <FontAwesomeIcon size="xl">{icon}</FontAwesomeIcon>
        </div>}
        {open && <ListItemText
          classes={{
            root: classes.navMenuTextRoot,
            primary: isCurrentNavLink ? classes.currentNavMenuText : classes.navMenuText,
          }}
          primary={name} />}
        {open ? (expanded ? <ExpandLess /> : <ExpandMore />) : null}
      </MenuItem>,
      <Collapse key={`collapse-${name}`} in={expanded} timeout="auto" unmountOnExit>
        <MenuList component="div" className={classes.navMenuList}
          disablePadding>
          {subLinks.map(this.renderNavLink)}
        </MenuList>
      </Collapse>,
    ]
  }

  renderNavLink = ({ nestedLinks, link, name, icon }, idx) => {
    const { open, classes, location: { pathname } } = this.props
    const { activeNavItem } = this.state
    const isActiveNavLink = activeNavItem === name
    const isCurrentNavLink = link && matchPath(pathname, {
      path: link.path,
      exact: false,
      strict: false,
    })

    const redirect = () => { window.location = link.path }
    const handleClick = link.external ? redirect : this.getNavToFn(link.path)

    // if (nestedLinks) {
    //   this.renderNavFolder(name, link, nestedLinks, icon)
    // }
    return <MenuItem tabIndex={idx}
      className={clsx(classes.navMenuItem, {
        [classes.activeNavItem]: isActiveNavLink,
        [classes.currentNavLink]: !!isCurrentNavLink && !isActiveNavLink,
      })}
      onClick={handleClick}
      key={link.path}>
      {icon && <div className={classes.navIcon}>
        <FontAwesomeIcon title={name} size="xl">{icon}</FontAwesomeIcon>
      </div>}
      {open && <ListItemText
        classes={{
          root: classes.navMenuTextRoot,
          primary: isCurrentNavLink ? classes.currentNavMenuText : classes.navMenuText,
        }}
        primary={name} />}
    </MenuItem>
  }

  renderSections = sections => {
    const { classes } = this.props
    const { expandedSection } = this.state
    return sections.map(section =>
      <ExpansionPanel
        key={section.id}
        className={classes.nav}
        expanded={expandedSection === section.id}
        onChange={this.handleExpand(section.id)}>
        <ExpansionPanelSummary
          className={classes.navHeading}
          expandIcon={<ExpandMore />}>
          <Typography
            className={classes.navHeadingText}>{section.name}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.navBody}>
          {this.renderSectionLinks(section.links)}
        </ExpansionPanelDetails>
      </ExpansionPanel>)
  }

  renderSectionLinks = sectionLinks => {
    const { classes } = this.props
    const { filterText } = this.state
    const filteredLinks = filterText ? this.getFilteredLinks(sectionLinks) : sectionLinks
    return <MenuList component="nav" className={classes.navMenu}>
      {filteredLinks.map(this.renderNavLink)}
    </MenuList>
  }

  renderStackSlider = () => {
    const { classes, open } = this.props
    return <div className={classes.sliderContainer}>
      {open && <a href={clarityDashboardUrl}>
        <ChevronLeftIcon className={classes.sliderArrow} />
      </a>}
      <div className={classes.sliderLogo} />
      {open && <a href={clarityDashboardUrl}>
        <ChevronRightIcon className={classes.sliderArrow} />
      </a>}
    </div>
  }

  render () {
    const { classes, withStackSlider, sections, open, handleDrawerToggle, stack } = this.props
    // const filteredSections = sections.filter(where({ links: notEmpty }))
    // Because ironic regions will not currently support kubernetes, assume always
    // one filtered section, either openstack (ironic) or kubernetes
    const filteredSections = sections.filter(where({ id: equals(stack) }))

    return <div
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}>
      <IconButton className={classes.toggleButton} onClick={handleDrawerToggle}>
        <FontAwesomeIcon size="xl">{open ? 'angle-double-left' : 'angle-double-right'}</FontAwesomeIcon>
      </IconButton>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx(classes.paper, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
        anchor="left"
        open={open}
      >
        <div className={classes.drawerHeader} onClick={this.handleLogoClick}>
          <div className={classes.logo} />
          <div className={classes.logoTitle} />
        </div>
        {withStackSlider ? this.renderStackSlider() : null}
        {filteredSections.length > 1
          ? this.renderSections(filteredSections)
          : this.renderSectionLinks(propOr([], 'links', filteredSections[0]))}
      </Drawer>
    </div>
  }
}

const linkPropType = {
  name: PropTypes.string,
  link: PropTypes.shape({
    path: PropTypes.string,
  }),
  icon: PropTypes.string,
}

const sectionPropType = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      ...linkPropType,
      nestedLinks: PropTypes.arrayOf(PropTypes.shape(linkPropType)),
    }),
  ),
}

Navbar.propTypes = {
  withStackSlider: PropTypes.bool,
  open: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  sections: PropTypes.arrayOf(
    PropTypes.shape(sectionPropType),
  ).isRequired,
  stack: PropTypes.string,
}

Navbar.defaultProps = {
  open: true,
}

export default Navbar

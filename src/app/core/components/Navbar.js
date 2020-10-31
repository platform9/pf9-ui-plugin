import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  Collapse,
  Drawer,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ListItemText,
  MenuItem,
  MenuList,
  Button,
} from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { except, pathStrOr } from 'app/utils/fp'
import clsx from 'clsx'
import moize from 'moize'
import { assoc, flatten, pluck, prop, propEq, propOr, where, equals } from 'ramda'
import { matchPath, withRouter } from 'react-router'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { clarityDashboardUrl, helpUrl, ironicWizardUrl, dashboardUrl } from 'app/constants'
import Text from 'core/elements/text'

import SimpleLink from './SimpleLink'
// import { withAppContext } from 'core/providers/AppProvider'
import { sessionStoreKey } from 'core/session/sessionReducers'
import { connect } from 'react-redux'

export const drawerWidth = 180

const styles = (theme) => ({
  helpLink: {
    ...theme.typography.caption2,
  },
  bottomContentClose: {
    display: 'none !important',
  },
  bottomContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2, 1, 1, 1),
    backgroundColor: theme.components.header.background,
    '& a': {
      margin: theme.spacing(2, 0),
      textDecorationColor: '#e6e6e6 !important',
    },
    '& span, & i': {
      color: '#e6e6e6',
    },
    '& button': {
      backgroundColor: '#f3f3f4',
      textTransform: 'none',
      '&:hover': {
        backgroundColor: '#FFFFFF',
      },
      '& *': {
        color: theme.components.header.background,
      },
      '& i': {
        marginLeft: theme.spacing(),
      },
    },
  },
  drawer: {
    zIndex: 1000,
    position: 'relative',
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    height: '100%',
    minHeight: '100vh',
    backgroundColor: theme.components.sidebar.background,
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
    width: theme.spacing(6) + 2,
    // [theme.breakpoints.up('sm')]: {
    //   width: theme.spacing(5.5),
    // },
  },
  paper: {
    marginTop: ({ stack }) => (stack === 'account' ? 151 : 55),
    backgroundColor: 'inherit',
    overflow: 'hidden',
    borderRight: 0,
    bottom: 0,
    height: 'auto',
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
    backgroundColor: theme.components.sidebar.activeBackground,
    color: theme.components.sidebar.activeText,
  },
  currentNavLink: {
    backgroundColor: [theme.components.sidebar.activeBackground, '!important'],
    color: [theme.components.sidebar.activeText, '!important'],

    '&:hover *': {
      color: [theme.components.sidebar.hoverText, '!important'],
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
    ...theme.typography.sidenav,
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
      width: '23px',
      height: '18.5px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  navMenu: {
    padding: 0,
    width: '100%',
    flex: 1,
  },
  navMenuItem: {
    display: 'grid',
    gridTemplateColumns: '50px 1fr',
    padding: 0,
    minHeight: 45,
    backgroundColor: theme.components.sidebar.background,
    color: theme.components.sidebar.text,

    transition: 'background .3s ease',

    '& i, & span': {
      transition: 'color .3s ease',
    },
    '&:hover': {
      backgroundColor: theme.components.sidebar.activeBackground,
    },
    '&:hover *': {
      color: theme.components.sidebar.hoverText, // override child color styles
    },
    borderTop: '2px solid transparent',
    borderBottom: '2px solid transparent',
  },
  navMenuTextRoot: {
    flexGrow: 1,
    padding: theme.spacing(0, 0.5),
    whiteSpace: 'normal',
    margin: 0,
    display: 'block',
    lineHeight: '14px',

    '& > .MuiTypography-root': {
      ...theme.typography.sidenav,
    },
  },
  navMenuText: {
    fontSize: 12,
    fontWeight: 500,
    color: theme.components.sidebar.text,
  },
  toggleButton: {
    background: theme.components.header.background,
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
    color: theme.components.sidebar.activeText,
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
    backgroundImage: ({ stack }) => {
      if (stack === 'kubernetes') {
        return 'url(/ui/images/logo-kubernetes-h.png)'
      } else if (['openstack', 'metalstack'].includes(stack)) {
        return 'url(/ui/images/logo-sidenav-os.svg)'
      }
    },
    backgroundSize: ({ open, stack }) => {
      if (stack === 'kubernetes') {
        return open ? '120px' : '130px'
      } else if (['openstack', 'metalstack'].includes(stack)) {
        return open ? '120px' : '175px'
      }
    },
    backgroundPosition: ({ open, stack }) => {
      if (stack === 'kubernetes') {
        return open ? '7px center' : '9px center'
      } else if (['openstack', 'metalstack'].includes(stack)) {
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
    color: theme.components.sidebar.text,
    cursor: 'pointer',
  },
  heavyWeight: {
    '& i': {
      fontWeight: 500,
    },
  },
})

// TODO: @john to verify this connect change works from appContext
@withStyles(styles, { withTheme: true })
@withRouter
@connect((state) => prop(sessionStoreKey))
class Navbar extends PureComponent {
  state = {
    expandedSection: null,
    anchor: 'left',
    expandedItems: [],
    activeNavItem: null,
    filterText: '',
  }

  handleEscKey = () => {
    this.setState((prevState) => ({
      ...prevState,
      activeNavItem: null,
      filterText: '',
    }))
  }

  handleArrowKeys = (direction) => () => {
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
      this.setState(
        (prevState) => ({
          ...prevState,
          activeNavItem: null,
          filterText: '',
        }),
        () => this.props.history.push(activeNavLink.path),
      )
    }
  }

  handleExpand = moize((sectionName) => () => this.setState(assoc('expandedSection', sectionName)))

  handleFilterChange = (e) => {
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

  flattenLinks = moize((links) =>
    flatten(links.map((link) => (link.nestedLinks ? this.flattenLinks(link.nestedLinks) : [link]))),
  )

  getFilteredLinks = (links) => {
    const { filterText } = this.state
    return this.flattenLinks(links).filter(({ name }) =>
      name.toLocaleLowerCase().includes(filterText.toLocaleLowerCase()),
    )
  }

  getSectionLinks = () => {
    const sectionLinks = flatten(pluck('links', this.props.sections))
    return this.getFilteredLinks(sectionLinks)
  }

  getNavToFn = moize((link) => () => {
    this.props.history.push(link)
  })

  toggleFoldingAndNavTo = moize((name, path) => () => {
    this.setState(
      ({ expandedItems, ...state }) => ({
        ...state,
        expandedItems: expandedItems.includes(name)
          ? except(name, expandedItems)
          : [name, ...expandedItems],
      }),
      () => {
        if (path) {
          this.props.history.push(path)
        }
      },
    )
  })

  handleNavigateToClarity = () => {
    window.location = clarityDashboardUrl
  }

  renderNavFolder = (name, link, subLinks, icon) => {
    const {
      classes,
      location: { pathname, hash },
      open,
    } = this.props
    const matchesCurrentPath = (link) =>
      link &&
      matchPath(`${pathname}${hash}`, {
        path: link.path,
        exact: true,
        strict: false,
      })
    const redirect = () => {
      window.location = link.path
    }
    const handleClick = link.external
      ? redirect
      : this.toggleFoldingAndNavTo(name, prop('path', link))
    const isCurrentNavLink = matchesCurrentPath(link)
    const expanded =
      open &&
      (subLinks.some(({ link }) => matchesCurrentPath(link)) ||
        this.state.expandedItems.includes(name))
    return [
      <MenuItem
        key={`menuItem-${name}`}
        onClick={handleClick}
        className={clsx(classes.navMenuItem, {
          [classes.currentNavLink]: !!isCurrentNavLink,
        })}
      >
        {icon && (
          <div className={classes.navIcon}>
            <FontAwesomeIcon size="lg">{icon}</FontAwesomeIcon>
          </div>
        )}
        {open && (
          <ListItemText
            classes={{
              root: classes.navMenuTextRoot,
              primary: isCurrentNavLink ? classes.currentNavMenuText : classes.navMenuText,
            }}
            primary={name}
          />
        )}
        {open ? expanded ? <ExpandLess /> : <ExpandMore /> : null}
      </MenuItem>,
      <Collapse key={`collapse-${name}`} in={expanded} timeout="auto" unmountOnExit>
        <MenuList component="div" className={classes.navMenuList} disablePadding>
          {subLinks.map(this.renderNavLink)}
        </MenuList>
      </Collapse>,
    ]
  }

  renderNavLink = ({ nestedLinks, link, name, icon }, idx) => {
    const {
      open,
      classes,
      location: { pathname },
    } = this.props
    const { activeNavItem } = this.state
    const isActiveNavLink = activeNavItem === name
    const isCurrentNavLink =
      link &&
      matchPath(pathname, {
        path: link.path,
        exact: false,
        strict: false,
      })

    const redirect = () => {
      window.location = link.path
    }
    const handleClick = link.external ? redirect : this.getNavToFn(link.path)

    // if (nestedLinks) {
    //   this.renderNavFolder(name, link, nestedLinks, icon)
    // }
    return (
      <MenuItem
        tabIndex={idx}
        className={clsx(classes.navMenuItem, {
          [classes.activeNavItem]: isActiveNavLink,
          [classes.currentNavLink]: !!isCurrentNavLink && !isActiveNavLink,
        })}
        onClick={handleClick}
        key={link.path}
      >
        {icon && (
          // TODO: come up with a better way to conditionally make an icon a heavier weight
          <div className={clsx(classes.navIcon, icon === 'cubes' && classes.heavyWeight)}>
            <FontAwesomeIcon title={name} size="lg">
              {icon}
            </FontAwesomeIcon>
          </div>
        )}
        {open && (
          <ListItemText
            classes={{
              root: classes.navMenuTextRoot,
              primary: isCurrentNavLink ? classes.currentNavMenuText : classes.navMenuText,
            }}
            primary={name}
          />
        )}
      </MenuItem>
    )
  }

  renderSections = (sections) => {
    const { classes } = this.props
    const { expandedSection } = this.state
    return sections.map((section) => (
      <Accordion
        key={section.id}
        className={classes.nav}
        expanded={expandedSection === section.id}
        onChange={this.handleExpand(section.id)}
      >
        <AccordionSummary className={classes.navHeading} expandIcon={<ExpandMore />}>
          <Text className={classes.navHeadingText}>{section.name}</Text>
        </AccordionSummary>
        <AccordionDetails className={classes.navBody}>
          {this.renderSectionLinks(section.links)}
        </AccordionDetails>
      </Accordion>
    ))
  }

  renderSectionLinks = (sectionLinks) => {
    const { classes } = this.props
    const { filterText } = this.state
    const filteredLinks = filterText ? this.getFilteredLinks(sectionLinks) : sectionLinks
    return (
      <MenuList component="nav" className={classes.navMenu}>
        {filteredLinks.map(this.renderNavLink)}
      </MenuList>
    )
  }

  switchStacks = (direction) => {
    const { stack, stacks, setStack, history } = this.props
    const newStack = stacks[stack][direction]

    if (newStack === 'metalstack') {
      setStack('metalstack')
      return history.push(ironicWizardUrl)
    } else if (newStack === 'openstack') {
      this.handleNavigateToClarity()
    } else if (newStack === 'kubernetes') {
      setStack('kubernetes')
      return history.push(dashboardUrl)
    }
  }

  renderStackSlider = () => {
    // Todo: Animate the stack slider
    const { classes, open } = this.props
    return (
      <div className={classes.sliderContainer}>
        {open && (
          <a>
            <ChevronLeftIcon
              className={classes.sliderArrow}
              onClick={() => this.switchStacks('left')}
            />
          </a>
        )}
        <div className={classes.sliderLogo} />
        {open && (
          <a>
            <ChevronRightIcon
              className={classes.sliderArrow}
              onClick={() => this.switchStacks('right')}
            />
          </a>
        )}
      </div>
    )
  }

  render() {
    const {
      classes,
      withStackSlider,
      sections,
      open,
      handleDrawerToggle,
      stack,
      features,
    } = this.props
    // const filteredSections = sections.filter(where({ links: notEmpty }))
    // Because ironic regions will not currently support kubernetes, assume always
    // one filtered section, either openstack (ironic) or kubernetes
    const filteredSections = sections.filter(where({ id: equals(stack) }))

    // const { features } = getContext()
    const isDecco = pathStrOr(false, 'experimental.kplane', features)
    const isSandbox = pathStrOr(false, 'experimental.sandbox', features)
    const version = pathStrOr('4', 'releaseVersion', features)

    return (
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
        {withStackSlider && stack !== 'account' ? this.renderStackSlider() : null}
        {filteredSections.length > 1
          ? this.renderSections(filteredSections)
          : this.renderSectionLinks(propOr([], 'links', filteredSections[0]))}

        <div
          className={clsx(classes.bottomContent, {
            [classes.bottomContentClose]: !open,
          })}
        >
          {!(isDecco || isSandbox) && (
            <Button onClick={this.handleNavigateToClarity}>
              <Text variant="caption2">Back to Legacy UI</Text>
              <FontAwesomeIcon size="md">undo</FontAwesomeIcon>
            </Button>
          )}
          <SimpleLink src={helpUrl} className={classes.helpLink}>
            <FontAwesomeIcon>question-circle</FontAwesomeIcon> <span>Need Help?</span>
          </SimpleLink>
          <Text variant="caption2" component="span">
            Version {version}
          </Text>
        </div>
      </Drawer>
    )
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
  sections: PropTypes.arrayOf(PropTypes.shape(sectionPropType)).isRequired,
  stack: PropTypes.string,
  setStack: PropTypes.func,
}

Navbar.defaultProps = {
  open: true,
}

export default Navbar

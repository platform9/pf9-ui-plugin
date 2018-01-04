import React, { PureComponent } from 'react'
import { matchPath, withRouter } from 'react-router'
import { assoc, flatten, pluck, prop, propEq, propOr } from 'ramda'
import moize from 'moize'
import PropTypes from 'prop-types'
import {
  Collapse, Divider, Drawer, ExpansionPanel, ExpansionPanelDetails,
  ExpansionPanelSummary, IconButton, InputBase, ListItemIcon, ListItemText,
  MenuItem, MenuList, Typography
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import SearchIcon from '@material-ui/icons/Search'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ExpandLess from '@material-ui/icons/ExpandLess'
import { withHotKeys } from 'core/components/HotKeysProvider'
import { except } from 'core/../../utils/fp'
import { fade } from '@material-ui/core/styles/colorManipulator'
import classnames from 'classnames'

export const drawerWidth = 240

const styles = theme => ({
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
    width: theme.spacing.unit * 6,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    fontSize: theme.typography.fontSize * 1.2,
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 6,
    transition: theme.transitions.create('width'),
    width: '100%'
  },
  nav: {
    margin: 0
  },
  activeNavItem: {
    backgroundColor: theme.palette.primary.dark,
    color: '#fff'
  },
  currentNavLink: {
    backgroundColor: theme.palette.grey[300],
  },
  navHeading: {
    backgroundColor: theme.palette.grey[50],
    paddingTop: 0,
    paddingRight: theme.spacing.unit * 1,
    paddingBottom: 0,
    paddingLeft: theme.spacing.unit * 1,
  },
  navHeadingText: {
    ...theme.typography.subtitle2,
    padding: 0,
  },
  navBody: {
    padding: 0,
  },
  navMenu: {
    padding: 0,
    width: '100%',
  },
  navMenuItem: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 2,
  },
  navMenuList: {
    paddingLeft: theme.spacing.unit
  }
})

@withStyles(styles, { withTheme: true })
@withHotKeys
@withRouter
class Navbar extends PureComponent {
  constructor (props) {
    super(props)
    this.searchInputRef = React.createRef()
    props.setHotKeyHandler('f', this.focusSearch)
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

  focusSearch = () => {
    if (this.searchInputRef.current) {
      this.searchInputRef.current.focus()
    }
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
        : [link]))
  )

  getFilteredLinks = links => {
    const { filterText } = this.state
    return this.flattenLinks(links).filter(({ name }) =>
      name.toLocaleLowerCase().includes(filterText.toLocaleLowerCase())
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
          : [name, ...expandedItems]
      }), () => {
        if (path) {
          this.props.history.push(path)
        }
      }
    )
  })

  renderNavFolder = (name, link, subLinks, icon) => {
    const { classes, location: { pathname, hash } } = this.props
    const matchesCurrentPath = link => link && matchPath(`${pathname}${hash}`, {
      path: link.path,
      exact: true,
      strict: false
    })
    const isCurrentNavLink = matchesCurrentPath(link)
    const expanded = subLinks.some(({ link }) => matchesCurrentPath(link)) ||
      this.state.expandedItems.includes(name)
    return [
      <MenuItem
        key={name}
        onClick={this.toggleFoldingAndNavTo(name, prop('path', link))}
        className={classnames(classes.navMenuItem, {
          [classes.currentNavLink]: !!isCurrentNavLink,
        })}>
        {icon && (<ListItemIcon>{icon}</ListItemIcon>)}
        <ListItemText
          primaryTypographyProps={{ color: 'textPrimary', variant: 'overline' }}
          primary={name} />
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </MenuItem>,
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <MenuList component="div" className={classes.navMenuList}
          disablePadding>
          {subLinks.map(this.renderNavLink)}
        </MenuList>
      </Collapse>
    ]
  }

  renderNavLink = ({ nestedLinks, link, name, icon }, idx) => {
    const { classes, location: { pathname, hash } } = this.props
    const { activeNavItem } = this.state
    const isActiveNavLink = activeNavItem === name
    const isCurrentNavLink = link && matchPath(`${pathname}${hash}`, {
      path: link.path,
      exact: true,
      strict: false
    })

    return nestedLinks ? (
      this.renderNavFolder(name, link, nestedLinks, icon)
    ) : (
      <MenuItem tabIndex={idx}
        className={classnames(classes.navMenuItem, {
          [classes.activeNavItem]: isActiveNavLink,
          [classes.currentNavLink]: !!isCurrentNavLink && !isActiveNavLink,
        })}
        onClick={this.getNavToFn(link.path)}
        key={link.path}>
        {icon && (
          <ListItemIcon>
            {icon}
          </ListItemIcon>
        )}
        <ListItemText
          primaryTypographyProps={{ color: isActiveNavLink ? 'inherit' : 'textPrimary' }}
          primary={name} />
      </MenuItem>
    )
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
    return <MenuList component="nav" className={classes.navMenu}>
      {(filterText
        ? this.getFilteredLinks(sectionLinks)
        : sectionLinks
      ).map(this.renderNavLink)}
    </MenuList>
  }

  render () {
    const { classes, withSearchBar, sections, open, handleDrawerClose } = this.props
    const filteredSections = sections.filter(section =>
      section.links && section.links.length > 0)

    return <Drawer
      variant="persistent"
      classes={{ paper: classes.drawerPaper }}
      anchor="left"
      open={open}
    >
      <div className={classes.drawerHeader}>
        {withSearchBar ? this.renderNavFilterBar() : null}
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <Divider />
      {filteredSections.length > 1
        ? this.renderSections(filteredSections)
        : this.renderSectionLinks(propOr([], 'links', filteredSections[0]))}
    </Drawer>
  }
}

const linkPropType = {
  name: PropTypes.string,
  link: PropTypes.shape({
    path: PropTypes.string
  }),
  icon: PropTypes.element
}

const sectionPropType = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      ...linkPropType,
      nestedLinks: PropTypes.arrayOf(PropTypes.shape(linkPropType))
    })
  )
}

Navbar.propTypes = {
  withSearchBar: PropTypes.bool,
  open: PropTypes.bool,
  handleDrawerClose: PropTypes.func,
  sections: PropTypes.arrayOf(
    PropTypes.shape(sectionPropType)
  ).isRequired
}

Navbar.defaultProps = {
  open: true
}

export default Navbar

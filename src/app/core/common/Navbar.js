import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import { assoc, flatten, prop } from 'ramda'
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
import { withHotKeys } from 'core/common/HotKeysProvider'
import { except } from 'core/fp'
import { fade } from '@material-ui/core/styles/colorManipulator'

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
    props.setHotKeyHandler('f', this.focusSearch, {
      ctrlKey: false
    })
  }

  state = {
    expandedSection: null,
    anchor: 'left',
    expandedItems: [],
    filterText: '',
  }

  focusSearch = () => {
    if (this.searchInputRef.current) {
      this.searchInputRef.current.focus()
    }
  }

  handleExpand = moize(sectionName =>
    () => this.setState(assoc('expandedSection', sectionName)))

  handleFilterChange = e => {
    const { value } = e.target
    this.setState(prevState => ({ ...prevState, filterText: value }))
  }

  flattenLinks = moize(links =>
    flatten(
      links.map(link => link.nestedLinks
        ? this.flattenLinks(link.nestedLinks)
        : [link]))
  )

  getFilteredLinks = (filterText, links) => {
    return this.flattenLinks(links).filter(({ name }) =>
      name.toLocaleLowerCase().includes(filterText.toLocaleLowerCase())
    )
  }

  navTo = moize(link => () => {
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
          this.navTo(path)
        }
      }
    )
  })

  renderNavFolder = (name, link, subLinks, icon) => {
    const expanded = this.state.expandedItems.includes(name)
    const { classes } = this.props
    return [
      <MenuItem className={classes.navMenuItem}
        onClick={this.toggleFoldingAndNavTo(name, prop('path', link))}
        key={name}>
        {icon && (
          <ListItemIcon>
            {icon}
          </ListItemIcon>
        )}
        <ListItemText
          primaryTypographyProps={{ color: 'primary', variant: 'overline' }}
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

  renderNavLink = ({ nestedLinks, link, name, icon }) => {
    const { classes } = this.props
    return nestedLinks ? (
      this.renderNavFolder(name, link, nestedLinks, icon)
    ) : (
      <MenuItem className={classes.navMenuItem} onClick={this.navTo(link.path)}
        key={link.path}>
        {icon && (
          <ListItemIcon>
            {icon}
          </ListItemIcon>
        )}
        <ListItemText primary={name} />
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

  render () {
    const { classes, withSearchBar, sections, open, handleDrawerClose } = this.props
    const { filterText, expandedSection } = this.state
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
      {filteredSections.map(section =>
        filteredSections.length > 1 ? <ExpansionPanel
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
            <MenuList component="nav" className={classes.navMenu}>
              {(filterText
                ? this.getFilteredLinks(filterText, section.links)
                : section.links
              ).map(this.renderNavLink)}
            </MenuList>
          </ExpansionPanelDetails>
        </ExpansionPanel> : <MenuList
          component="nav"
          key={section.id}
          className={classes.navMenu}>
          {(filterText
            ? this.getFilteredLinks(filterText, section.links)
            : section.links
          ).map(this.renderNavLink)}
        </MenuList>)}
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

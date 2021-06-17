import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import { Paper, Tab as MDTab, Tabs as MDTabs } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { compose } from 'utils/fp'
import PropTypes from 'prop-types'
import clsx from 'clsx'

const TabContext = React.createContext({})
export const Consumer = TabContext.Consumer
export const Provider = TabContext.Provider

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    boxShadow: '0 0 0 0',
  },
  tabColor: {
    color: theme.palette.text.primary,
  },
  muiTabRoot: {
    minHeight: ({ compact }) => (compact ? 34 : 38),
  },
})
const tabIndicatorProps = { style: { height: 3 } }
const tabStyles = (theme) => ({
  root: {
    ...theme.typography.subtitle1,
    textTransform: 'none',
    fontSize: ({ compact }) => (compact ? 14 : 21),
    minWidth: 100,
    padding: 0,
    marginRight: ({ compact }) => (compact ? 10 : 15),
    margin: '0 0 -1px',
    cursor: 'default',
    minHeight: ({ compact }) => (compact ? 34 : 38),
    color: theme.palette.grey[500],
    opacity: 1,
    '&.Mui-selected': {
      color: theme.palette.common.black,
    },
    '&:hover:not(.Mui-selected)': {
      cursor: 'pointer',
      color: theme.palette.common.black,
    },
  },
  wrapper: {
    padding: ({ compact }) => (compact ? theme.spacing(0.5, 1, 0) : theme.spacing(0.5, 2, 0)),
    marginBottom: ({ compact }) => (compact ? 0 : theme.spacing(1)),
    transition: 'all .2s',
    lineHeight: 1,
  },
})

const CustomTab = withStyles(tabStyles)(({ compact, ...rest }) => <MDTab {...rest} />)

class Tabs extends PureComponent {
  addTab = (tab) => {
    this.setState((state) => ({ tabs: [...state.tabs, tab] }), this.activateDefaultTab)
  }

  state = {
    value: false,
    tabs: [],
    addTab: this.addTab,
  }

  static getDerivedStateFromProps(props, state) {
    if (props.useUrlHashes && props.location.hash && props.location.hash !== state.value) {
      return {
        value: props.location.hash.substr(1) || false,
      }
    }
    return null
  }

  activateDefaultTab = () => {
    const { tabs, value } = this.state
    if (!value && tabs.length > 0) {
      this.setState({ value: tabs[0].value })
    }
  }

  handleChange = (e, value) => {
    if (this.props.onChange) {
      this.props.onChange(value)
    }
    this.setState({ value })
  }

  render() {
    const { tabs, value } = this.state
    const { children, classes, useUrlHashes, compact, className } = this.props
    return (
      <Paper className={clsx(this.props.classes.root, className)}>
        <div className={classes.tabColor}>
          <MDTabs
            value={value}
            className={classes.muiTabRoot}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="inherit"
            TabIndicatorProps={tabIndicatorProps}
          >
            {tabs.map((tab) => (
              <CustomTab
                compact={compact}
                key={tab.value}
                value={tab.value}
                label={tab.label}
                href={useUrlHashes ? `#${tab.value}` : null}
              />
            ))}
          </MDTabs>
          <Provider value={this.state}>{children}</Provider>
        </div>
      </Paper>
    )
  }
}

export const withTabContext = (Component) => (props) => {
  return (
    <Consumer>
      {({ value, addTab }) => <Component {...props} activeTab={value} addTab={addTab} />}
    </Consumer>
  )
}

Tabs.propTypes = {
  compact: PropTypes.bool,
  useUrlHashes: PropTypes.bool,
  className: PropTypes.string,
}

Tabs.defaultProps = {
  compact: false,
  useUrlHashes: true,
  className: undefined,
}

export default compose(withStyles(styles), withRouter)(Tabs)

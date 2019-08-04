import React from 'react'
import { withRouter } from 'react-router-dom'
import { Grid, Paper, Tab as MDTab, Tabs as MDTabs } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { compose } from 'utils/fp'

const TabContext = React.createContext({})
export const Consumer = TabContext.Consumer
export const Provider = TabContext.Provider

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    boxShadow: '0 0 0 0',
    backgroundColor: theme.palette.background.default,
  },

  tabColor: {
    color: theme.palette.text.primary,
  },
})

const tabStyles = theme => ({
  root: {
    textTransform: 'none',
    fontSize: '21px',
    minWidth: 100,
    padding: 0,
    margin: '0 0 -1px',
    '&:hover:not(.Mui-selected) .MuiTab-wrapper': {
      cursor: 'pointer',
      boxShadow: `inset 0 -2px 0 ${theme.palette.primary.main}`,
      color: theme.palette.primary.main,
    },
  },
  wrapper: {
    padding: '5px 15px 15px',
    transition: 'all .2s',
    marginRight: 15,
    lineHeight: 1,
    cursor: 'default',
  },
})

const CustomTab = withStyles(tabStyles)(MDTab)

class Tabs extends React.Component {
  addTab = tab => {
    this.setState(
      state => ({ tabs: [...state.tabs, tab] }), this.activateDefaultTab)
  }

  state = {
    value: false,
    tabs: [],
    addTab: this.addTab,
  }

  static getDerivedStateFromProps (props, state) {
    if (props.location.hash && props.location.hash !== state.value) {
      return {
        value: props.location.hash || false,
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
    this.setState({ value })
  }

  render () {
    const { tabs, value } = this.state
    const { children, classes } = this.props
    return (
      <Provider value={this.state}>
        <Grid container justify="center">
          <Grid item xs={12} zeroMinWidth>
            <Paper className={this.props.classes.root}>
              <div className={classes.tabColor}>
                <MDTabs
                  value={value}
                  onChange={this.handleChange}
                  indicatorColor="primary"
                  textColor="inherit"
                  TabIndicatorProps={{ style: { display: 'none' } }}
                >
                  {tabs.map(tab =>
                    <CustomTab key={tab.value} value={tab.value} label={tab.label} href={tab.value} />,
                  )}
                </MDTabs>
                {children}
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Provider>
    )
  }
}

export const withTabContext = Component => props => {
  return (
    <Consumer>
      {
        ({ value, addTab }) =>
          <Component
            {...props}
            activeTab={value}
            addTab={addTab}
          />
      }
    </Consumer>
  )
}

export default compose(
  withStyles(styles),
  withRouter,
)(Tabs)

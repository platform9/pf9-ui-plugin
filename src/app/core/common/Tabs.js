import React from 'react'
import { Grid, Paper, Tabs as MDTabs, Tab as MDTab } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { withRouter } from 'react-router-dom'
import { compose } from 'core/fp'

const TabContext = React.createContext({})
export const Consumer = TabContext.Consumer
export const Provider = TabContext.Provider

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    boxShadow: '0 0 0 0',
    backgroundColor: theme.palette.background.default
  }
})

class Tabs extends React.Component {
  addTab = tab => {
    this.setState(state => ({ tabs: [...state.tabs, tab] }), this.activateDefaultTab)
  }

  state = {
    tabs: [],
    value: this.props.location.hash || false,
    addTab: this.addTab,
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
    const { children } = this.props

    return (
      <Provider value={this.state}>
        <Grid container justify="center">
          <Grid item xs={12} zeroMinWidth>
            <Paper className={this.props.classes.root}>
              <MDTabs
                value={value}
                onChange={this.handleChange}
                indicatorColor="primary"
                textColor="primary"
              >
                {tabs.map(tab =>
                  <MDTab key={tab.value} value={tab.value} label={tab.label} href={tab.value} />
                )}
              </MDTabs>
              {children}
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
  withRouter
)(Tabs)

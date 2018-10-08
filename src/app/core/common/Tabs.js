import React from 'react'
import { Grid, Paper, Tabs as MDTabs, Tab as MDTab, Typography } from '@material-ui/core'
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

const TabContainer = ({ children, dir }) => (
  <Typography component="div" dir={dir} >{children}</Typography>
)

class Tab extends React.Component {
  state = {
    tabs: [],
    value: this.props.location.hash,
  }

  activeTab = () => {
    const { tabs, value } = this.state
    return tabs.find(tab => tab.id === value)
  }

  handleChange = (e, value) => {
    this.setState({ value })
  }

  renderActiveTab = () => {
    const tab = this.activeTab()
    if (!tab) { return null }
    return (
      <TabContainer>{tab}</TabContainer>
    )
  }

  render () {
    const { tabs, value } = this.state

    return (
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
                <MDTab key={tab.id} value={tab.id} label={tab.label} href={tab.id} />
              )}
            </MDTabs>
            {this.renderActiveTab()}
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

export const withTabContext = Component => props => {
  return (
    <Consumer>
      {
        ({ activeTab }) =>
          <Component
            {...props}
            activeTab={activeTab}
          />
      }
    </Consumer>
  )
}

export default compose(
  withStyles(styles),
  withRouter
)(Tab)

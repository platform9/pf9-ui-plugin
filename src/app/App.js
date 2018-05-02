import React from 'react'
import PropTypes from 'prop-types'
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom'
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import './app.css'
import { setupFromConfig } from './util/registry'
import config from '../../config'

setupFromConfig(config)

class App extends React.Component {
  render () {
    const theme = createMuiTheme({
      palette: {
        type: this.props.theme
      }
    })

    const { pluginManager } = this.context
    const options = pluginManager.getOptions()
    const { showNavMenu, showSidebar, showFooter } = options

    const renderNavMenu = () => (
      <div id="_nav-menu">
        <ul>
          {pluginManager.getNavItems().map(navItem => <li key={navItem.name}><Link to={navItem.link.path}>{navItem.name}</Link></li>)}
        </ul>
      </div>
    )

    const renderSidebar = () => (
      <div id="_main-sidebar">
        TODO: Sidebar
      </div>
    )

    const renderFooter = () => (
      <div id="_main-footer">
        TODO: Footer
      </div>
    )

    return (
      <Router>
        <MuiThemeProvider theme={theme}>
          <div id="_main-container">
            {showNavMenu && renderNavMenu()}
            {showSidebar && renderSidebar()}
            <div id="_main-content">
              {pluginManager.getComponents().map((PluginComponent, idx) => <PluginComponent key={idx} />)}
              <Switch>
                {pluginManager.getRoutes().map(route => {
                  const { component, link } = route
                  const Component = component
                  return <Route key={route.name} path={link.path} exact={link.exact || false} component={Component} />
                })}
                <Redirect to={pluginManager.getDefaultRoute()} />
              </Switch>
            </div>
            {showFooter && renderFooter()}
          </div>
        </MuiThemeProvider>
      </Router>
    )
  }
}

App.contextTypes = {
  pluginManager: PropTypes.object
}

export default App

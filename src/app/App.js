import React from 'react'
import PropTypes from 'prop-types'
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core'
import Navbar from 'core/common/Navbar'
import LogoutPage from 'openstack/components/LogoutPage'
import './app.css'
import { setupFromConfig } from './util/registry'
import config from '../../config'
import AppContext from 'core/AppContext'
import OpenstackClient from '../openstack-client'
import SessionManager from './plugins/openstack/components/SessionManager'
import AddVolumePage from 'openstack/components/volumes/AddVolumePage'

setupFromConfig(config)
window.process = process

if (!config.apiHost) { throw new Error('config.js does not contain "apiHost"') }

const openstackClient = new OpenstackClient({ keystoneEndpoint: `${config.apiHost}/keystone` })
openstackClient.setActiveRegion(config.region)

class App extends React.Component {
  render () {
    const theme = createMuiTheme({
      palette: {
        type: this.props.theme,
        primary: {
          light: '#aee0ff',
          main: '#4aa3df',
          dark: '#1e699c',
          contrastText: '#fff',
        }
      }
    })

    const { pluginManager } = this.props
    const options = pluginManager.getOptions()
    const { showFooter } = options

    const renderFooter = () => (
      <div id="_main-footer">
        TODO: Footer
      </div>
    )

    return (
      <Router>
        <MuiThemeProvider theme={theme}>
          <AppContext initialContext={{ openstackClient }}>
            <div id="_main-container">
              <SessionManager>
                <Navbar links={pluginManager.getNavItems()}>
                  {pluginManager.getComponents().map((PluginComponent, idx) => <PluginComponent key={idx} />)}
                  <Switch>
                    {pluginManager.getRoutes().map(route => {
                      const { component, link } = route
                      const Component = component
                      return <Route key={route.name} path={link.path} exact={link.exact || false} component={Component} />
                    })}
                    <Route path="/ui/openstack/storage/volumes/add" component={AddVolumePage} />
                    <Route path="/ui/openstack/login" component={null} />
                    <Route path="/ui/logout" exact component={LogoutPage} />
                    <Redirect to={pluginManager.getDefaultRoute()} />
                  </Switch>
                  {showFooter && renderFooter()}
                </Navbar>
              </SessionManager>
            </div>
          </AppContext>
        </MuiThemeProvider>
      </Router>
    )
  }
}

App.propTypes = {
  pluginManager: PropTypes.object
}

export default App

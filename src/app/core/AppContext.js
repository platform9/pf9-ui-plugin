import React from 'react'
import PropTypes from 'prop-types'
import { setStateLens } from 'core/fp'

const Context = React.createContext({})
export const Consumer = Context.Consumer
export const Provider = Context.Provider

class AppContext extends React.Component {
  state = {
    ...this.props.initialContext,

    setContext: (...args) => this.setState(...args),

    // Utility function that sets both
    // context.session.userPreferences[key] and also
    // sets it in localStorage
    setUserPreference: (key, value) => {
      const path = ['session', 'userPreferences', key]
      this.setState(setStateLens(value, path))
    }
  }

  render () {
    return (
      <Provider value={this.state}>
        {this.props.children}
      </Provider>
    )
  }
}

AppContext.propTypes = {
  initialContext: PropTypes.object
}

AppContext.defaultProps = {
  initialContext: {}
}

export const withAppContext = Component => props =>
  <Consumer>
    {
      ({ setContext, ...rest }) =>
        <Component {...props} setContext={setContext} context={rest} />
    }
  </Consumer>

export default AppContext

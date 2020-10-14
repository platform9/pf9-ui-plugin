import React from 'react'
import ReactDOM from 'react-dom'
import './bootstrap'
import App from './App'
import Bugsnag from '@bugsnag/js'

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React)

ReactDOM.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById('root'),
)

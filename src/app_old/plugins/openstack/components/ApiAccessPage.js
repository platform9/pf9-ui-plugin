import React from 'react'

import ApiAccessListContainer from './api-access/ApiAccessListContainer'

class ApiAccessPage extends React.Component {
  render () {
    return (
      <div>
        <h1>API Access Page</h1>
        <ApiAccessListContainer />
      </div>
    )
  }
}

export default ApiAccessPage

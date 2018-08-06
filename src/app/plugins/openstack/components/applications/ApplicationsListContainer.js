import React from 'react'
import PropTypes from 'prop-types'
import CardTable from './CardTable'

class ApplicationsListContainer extends React.Component {
  render () {
    return (
      <div>
        {this.props.applications && <CardTable
          data={this.props.applications}
          searchTarget="name"
        />}
      </div>
    )
  }
}

ApplicationsListContainer.propTypes = {
  applications: PropTypes.arrayOf(PropTypes.object)
}

export default ApplicationsListContainer

import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import ApplicationsList from './ApplicationsList'
import ApplicationCard from './ApplicationCard'
import CardTable from './CardTable'
import { Grid } from '@material-ui/core'

class ApplicationsListContainer extends React.Component {
  render () {
    return (
      <div>
        <CRUDListContainer
          items={this.props.applications}
          objType="applications"
          addUrl="/ui/openstack/applications/add"
          editUrl="/ui/openstack/applications/edit"
        >
          {({ onDelete, onAdd, onEdit }) => (
            <ApplicationsList
              applications={this.props.applications}
              onAdd={onAdd}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          )}
        </CRUDListContainer>
        <Grid container spacing={24} justify="space-between">
          {this.props.applications &&
            this.props.applications.map(application => <ApplicationCard application={application} key={application.name} />)}
        </Grid>
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

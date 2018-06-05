import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { addCluster } from '../../actions/clusters'
import AddClusterForm from './AddClusterForm'

const mapStateToProps = state => ({})

@withRouter
@connect(mapStateToProps)
class AddClusterPage extends React.Component {
  handleSubmit = cluster => {
    const { dispatch, history } = this.props
    try {
      dispatch(addCluster(cluster))
      history.push('/ui/openstack/clusters')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <div>
        <h1>Add Cluster Page</h1>
        <AddClusterForm onSubmit={this.handleSubmit} />
      </div>
    )
  }
}

export default AddClusterPage

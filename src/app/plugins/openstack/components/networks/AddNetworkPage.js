import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { addNetwork } from '../../actions/networks'
import AddNetworkForm from './AddNetworkForm'

const mapStateToProps = state => ({})

@withRouter
@connect(mapStateToProps)
class AddNetworkPage extends React.Component {
  handleSubmit = network => {
    const { dispatch, history } = this.props
    try {
      dispatch(addNetwork(network))
      history.push('/ui/openstack/networks')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <div>
        <h1>Add Networks Page</h1>
        <AddNetworkForm onSubmit={this.handleSubmit} />
      </div>
    )
  }
}

export default AddNetworkPage

import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { addUser } from '../../actions/users'
import AddUserForm from './AddUserForm'

const mapStateToProps = state => ({})

@withRouter
@connect(mapStateToProps)
class AddUserPage extends React.Component {
  handleSubmit = user => {
    const { dispatch, history } = this.props
    try {
      dispatch(addUser(user))
      history.push('/ui/openstack/users')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <div>
        <h1>Add Users Page</h1>
        <AddUserForm onSubmit={this.handleSubmit} />
      </div>
    )
  }
}

export default AddUserPage

import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { addFlavor } from '../../actions/flavors'
import AddFlavorForm from './AddFlavorForm'

const mapStateToProps = state => ({})

@withRouter
@connect(mapStateToProps)
class AddFlavorPage extends React.Component {
  handleSubmit = flavor => {
    const { dispatch, history } = this.props
    try {
      dispatch(addFlavor(flavor))
      history.push('/flavors')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <div>
        <h1>Add Flavors Page</h1>
        <AddFlavorForm onSubmit={this.handleSubmit} />
      </div>
    )
  }
}

export default AddFlavorPage

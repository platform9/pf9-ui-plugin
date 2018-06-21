import React from 'react'
import PropTypes from 'prop-types'

const ValidatedFormContext = React.createContext({})

export const Consumer = ValidatedFormContext.Consumer
export const Provider = ValidatedFormContext.Provider

class ValidatedForm extends React.Component {
  setField = (field, value) => {
    this.setState(
      state => ({
        ...state,
        value: {
          ...state.value,
          [field]: value,
        },
      }),
    )
  }

  state = {
    value: this.props.initialValue || {},
    fields: {}, // child fields inject data here
    setField: this.setField,
  }

  handleSubmit = event => {
    event.preventDefault()
    console.log('TODO: handleSubmit')
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state.value)
    }
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <Provider value={this.state}>
          {this.props.children}
        </Provider>
      </form>
    )
  }
}

ValidatedForm.propTypes = {
  onSubmit: PropTypes.func
}

export default ValidatedForm

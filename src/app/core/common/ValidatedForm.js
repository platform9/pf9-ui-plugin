import React from 'react'
import PropTypes from 'prop-types'
import { compose, filterFields, setStateLens } from 'core/fp'
import { withRouter } from 'react-router-dom'
import { withApollo } from 'react-apollo'

const ValidatedFormContext = React.createContext({})

export const Consumer = ValidatedFormContext.Consumer
export const Provider = ValidatedFormContext.Provider

/**
 * ValidatedForm is a HOC wrapper for forms.  The child components define the
 * data value schema and the validations.
 */
class ValidatedForm extends React.Component {
  constructor (props) {
    super(props)
    if (props.triggerSubmit) {
      props.triggerSubmit(this.handleSubmit)
    }
  }
  /**
   * This stores the specification of the field, to be used for validation down the line.
   * This function will be called by the child components when they are initialized.
   */
  defineField = (field, spec) => {
    this.setState(setStateLens(spec, ['fields', field]))
  }

  /**
   * Child components invoke this from their 'onChange' (or equivalent).
   * Note: many components use event.target.value but we only need value here.
   * Note: values can be passed up to parent component by supplying a setContext function prop
   */
  setField = (field, value) => {
    this.setState(setStateLens(value, ['value', field]))
    // Pass field up to parent if there is a parent
    if (this.props.setContext) {
      this.props.setContext(this.state.value)
    }
  }

  state = {
    value: this.props.initialValue || {},
    fields: {}, // child fields inject data here
    setField: this.setField,
    defineField: this.defineField,
  }

  validateField = (field, value, validations, spec) => {
    // TODO: just a placeholder for now
    return true
  }

  validateForm = () => {
    const { fields, value } = this.state
    return Object.keys(fields).every(field => this.validateField(field, value[field], fields[field]))
  }

  handleSubmit = event => {
    const { action, onSubmit } = this.props
    const { value } = this.state
    if (event) {
      event.preventDefault()
    }

    if (!this.validateForm()) { return }

    if (onSubmit) {
      onSubmit(value)
    }

    switch (action) {
      case 'add':
        this.handleAdd()
        break
      case `update`:
        let inputObj = filterFields('id', '__typename')(this.state.value)
        this.handleUpdate(inputObj)
        break
    }
  }

  handleAdd = () => {
    const { client, history, addQuery, getQuery, backUrl, objType, cacheQuery } = this.props
    try {
      client.mutate({
        mutation: addQuery,
        variables: {
          input: this.state.value
        },
        update: (proxy, { data }) => {
          const tempData = proxy.readQuery({ query: getQuery })
          tempData[objType].push(data[cacheQuery])
          proxy.writeQuery({ query: getQuery, data: tempData })
        }
      })
      history.push(backUrl)
    } catch (err) {
      console.error(err)
    }
  }

  handleUpdate = inputObj => {
    const { client, history, objId, updateQuery, backUrl } = this.props
    try {
      client.mutate({
        mutation: updateQuery,
        variables: {
          id: objId,
          input: inputObj
        }
      })
      history.push(backUrl)
    } catch (err) {
      console.error(err)
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
  // GraphQl query to add an object
  addQuery: PropTypes.object,
  // GraphQl query to get an object
  getQuery: PropTypes.object,
  // GraphQl query to update an object
  updateQuery: PropTypes.object,
  // Action to take(add/delete/update)
  action: PropTypes.string,
  // Url to go back when the operation ends
  backUrl: PropTypes.string,
  // Type of objects to operate
  objType: PropTypes.string,
  // String of query to cache
  cacheQuery: PropTypes.string,
  // Id of object to update
  objId: PropTypes.string,
  // Initial values
  initialValue: PropTypes.object,
  // Set parent context
  onSubmit: PropTypes.func,
  triggerSubmit: PropTypes.func,
}

export const PropKeys = Object.keys(ValidatedForm.propTypes)

export default compose(
  withRouter,
  withApollo
)(ValidatedForm)

/**
 * withFormContext provides access to the form context through props.
 *
 * This pattern is needed because React does not provide access to context within
 * lifecycle methods (componentDidMount).
 *
 * See: https://github.com/facebook/react/issues/12397#issuecomment-375501574
 *
 * @param {Inject the form context into this Component through props.} Component
 */
export const withFormContext = Component => props =>
  <Consumer>
    {
      ({ defineField, setField, value }) =>
        <Component
          {...props}
          defineField={defineField}
          setField={setField}
          value={value}
        />
    }
  </Consumer>

withFormContext.propsToExclude = ['defineField', 'setField']

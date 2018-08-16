import React from 'react'
import PropTypes from 'prop-types'
import { withAppContext } from 'core/AppContext'
import Loader from 'core/common/Loader'
import DisplayError from 'core/common/DisplayError'

class DataLoader extends React.Component {
  state = {
    loading: false,
    error: null,
  }

  componentDidMount () {
    const { dataKey, loaderFn, setContext, context } = this.props
    if (context[dataKey] === undefined) {
      this.setState({ loading: true })
      const parseErr = err => {
        if (typeof err === 'string') { return err }
        if (err instanceof Error) { return err.message }
      }
      if (loaderFn) {
        try {
          const promise = loaderFn({ setContext, context })
          if (promise && promise.then) {
            return promise.then(
              () => { this.setState({ loading: false }) },
              err => { this.setState({ loading: false, error: parseErr(err) }) }
            )
          }
          // loaderFn is sync so loading is done
          this.setState({ loading: false })
        } catch (err) {
          console.log(err)
          this.setState({ loading: false, error: parseErr(err) })
        }
      }
    }
  }

  render () {
    const { loading, error } = this.state
    const { context, dataKey, children } = this.props
    if (loading) { return <Loader /> }
    if (error) { return <DisplayError error={error} /> }
    return children({ data: context[dataKey], loading, error, context })
  }
}

DataLoader.propTypes = {
  /**
   * Used to determine if data already exists in context.
   * If `context[dataKey]` exists it does not run the `loaderFn`.
   * Once the data has been loaded `context[dataKey]` is passed
   * to the child component in the `data` prop.
   */
  dataKey: PropTypes.string.isRequired,

  /**
   * This function is invoked when the data does not yet exist.
   * It is passed `setContext` to use for updating.
  */
  loaderFn: PropTypes.func.isRequired,
}

export default withAppContext(DataLoader)

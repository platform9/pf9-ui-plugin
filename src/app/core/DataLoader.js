import React from 'react'
import PropTypes from 'prop-types'
import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import { all, partition, pick, props } from 'ramda'
import { ensureArray, exists, propExists } from 'core/fp'
import { withAppContext } from 'core/AppContext'

class DataLoaderBase extends React.Component {
  state = {
    loading: false,
    error: null,
  }

  componentDidMount () {
    this.listener = window.addEventListener('scopeChanged', () => this.loadData())
    this.loadData()
  }

  componentWillUnmount () {
    window.removeEventListener('scopeChanged', this.listener)
  }

  doneLoading = () => {
    const { dataKey, context } = this.props
    const dataKeys = ensureArray(dataKey)
    return all(exists, props(dataKeys, context))
  }

  loadData = () => {
    const { loaderFn, setContext, context } = this.props
    if (!this.doneLoading()) {
      this.setState({ loading: true })
      const parseErr = err => {
        if (typeof err === 'string') { return err }
        if (err instanceof Error) { return err.message }
      }
      const loaderFns = ensureArray(loaderFn)
      try {
        const promises = loaderFns.map(fn => fn({ setContext, context }))
        const [promiseFns, syncFns] = partition(propExists('then'), promises) // eslint-disable-line no-unused-vars
        Promise.all(promises).then(
          () => { this.setState({ loading: false }) },
          err => { this.setState({ loading: false, error: parseErr(err) }) }
        )
      } catch (err) {
        console.log(err)
        this.setState({ loading: false, error: parseErr(err) })
      }
    }
  }

  render () {
    const { loading, error } = this.state
    const { context, dataKey, children } = this.props
    const dataKeys = ensureArray(dataKey)
    if (!context || !this.doneLoading()) { return <Loader /> }
    const data = dataKeys.length === 1 ? context[dataKey] : pick(dataKeys, context)
    if (loading || !data) { return <Loader /> }
    if (error) { return <DisplayError error={error} /> }
    return children({ data, loading, error, context })
  }
}

const DataLoader = withAppContext(DataLoaderBase)
DataLoader.propTypes = {
  /**
   * Used to determine if data already exists in context.
   * If `context[dataKey]` exists it does not run the `loaderFn`.
   * Once the data has been loaded `context[dataKey]` is passed
   * to the child component in the `data` prop.
   * Can also take an array of multiple dataKeys to check.
   */
  dataKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,

  /**
   * This function is invoked when the data does not yet exist.
   * It is passed `setContext` to use for updating.
   * Can also take an array of multiple loaders.
  */
  loaderFn: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.arrayOf(PropTypes.func),
  ]).isRequired,
}

export const withDataLoader = ({ dataKey, loaderFn }) => Component => props =>
  <DataLoader dataKey={dataKey} loaderFn={loaderFn}>
    {({ data }) => <Component data={data} {...props} />}
  </DataLoader>

export default DataLoader

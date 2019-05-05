import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import DisplayError from './components/DisplayError'
import Progress from './components/Progress'
import { asyncProps } from 'utils/fp'
import { mapObjIndexed, compose } from 'ramda'
import { withAppContext } from 'core/AppContext'

class DataLoaderBase extends PureComponent {
  state = {
    data: mapObjIndexed(() => [], this.props.loaders),
    loading: false,
    error: null,
  }

  async componentDidMount () {
    this.listener = window.addEventListener('scopeChanged', this.loadAll)
    await this.loadAll()
  }

  componentWillUnmount () {
    window.removeEventListener('scopeChanged', this.listener)
  }

  loadAll = async () =>
    this.setState({ loading: true }, async () => {
      const { loaders, options, context, setContext } = this.props
      try {
        const data = await asyncProps(mapObjIndexed(loader =>
          loader({ context, setContext, reload: options.reloadOnMount }), loaders,
        ))
        this.setState({ loading: false, data, error: null })
      } catch (err) {
        console.log(err)
        this.setState({ loading: false, error: err.toString() })
      }
    })

  loadOne = (loaderKey, params, reload, cascade = false) => {
    this.setState({ loading: true }, async () => {
      const { loaders, context, setContext } = this.props
      try {
        const data = await loaders[loaderKey]({ context, setContext, params, reload, cascade })
        this.setState(prevState => ({
          loading: false,
          error: null,
          data: { ...prevState.data, [loaderKey]: data },
        }))
      } catch (err) {
        console.log(err)
        this.setState({ loading: false, error: err.toString() })
      }
    })
  }

  render () {
    const { data, loading, error } = this.state
    if (error) {
      return <DisplayError error={error} />
    }
    const { children, options } = this.props
    return <Progress inline={options.inlineProgress} overlay loading={loading}>
      {children({ data, loading, error, reloadData: this.loadOne })}
    </Progress>
  }
}

const DataLoader = compose(
  withAppContext,
)(DataLoaderBase)

DataLoader.propTypes = {
  /**
   * Object with key value pairs where key is the dataKey and
   * value is a loaderFn or a spec of { requires, loaderFn }
   */
  loaders: PropTypes.object.isRequired,

  options: PropTypes.shape({
    inlineProgress: PropTypes.bool,
    reloadOnMount: PropTypes.bool,
  }),
}

DataLoader.defaultProps = {
  options: {
    inlineProgress: false,
    reloadOnMount: false,
  },
}

export const withDataLoader = (loaders, options) => Component => props => (
  <DataLoader loaders={loaders} options={options}>
    {loaderProps => <Component {...loaderProps} {...props} />}
  </DataLoader>
)

export default DataLoader

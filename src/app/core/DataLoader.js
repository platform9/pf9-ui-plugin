import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import DisplayError from './components/DisplayError'
import Progress from './components/Progress'
import { asyncProps } from 'utils/fp'
import { assoc, compose, mapObjIndexed, merge, pick } from 'ramda'
import { withAppContext } from 'core/AppContext'

class DataLoaderBase extends PureComponent {
  state = {
    loading: false,
    error: null,
  }

  async componentDidMount () {
    await this.loadAll()
  }

  loadAll = async () => {
    this.setState({ loading: true }, async () => {
      const { loaders, options, context, getContext, setContext } = this.props
      try {
        const data = await asyncProps(mapObjIndexed(loader =>
          loader({
            context,
            getContext,
            setContext,
            reload: options.reloadOnMount,
          }), loaders,
        ))
        setContext(merge(data))
        this.setState({ loading: false, error: null })
      } catch (err) {
        console.log(err)
        this.setState({ loading: false, error: err.toString() })
      }
    })
  }

  loadOne = (loaderKey, params, reload, cascade = false) => {
    this.setState({ loading: true }, async () => {
      const { loaders, context, getContext, setContext } = this.props
      try {
        const data = await loaders[loaderKey]({
          context,
          getContext,
          setContext,
          params,
          reload,
          cascade,
        })
        setContext(assoc(loaderKey, data))
        this.setState({ loading: false, error: null })
      } catch (err) {
        console.log(err)
        this.setState({ loading: false, error: err.toString() })
      }
    })
  }

  mapDataFromContext = () => {
    const { context, loaders } = this.props
    return pick(Object.keys(loaders), context)
  }

  render () {
    const { loading, error } = this.state
    if (error) {
      return <DisplayError error={error} />
    }
    const data = this.mapDataFromContext()
    const { children, options, ...rest } = this.props
    return <Progress inline={options.inlineProgress} overlay loading={loading}>
      {children({ ...rest, data, loading, error, reloadData: this.loadOne })}
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

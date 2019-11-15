import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import DisplayError from './components/DisplayError'
import Progress from './components/progress/Progress'
import { mapObjIndexed, equals } from 'ramda'
import { withAppContext } from 'core/providers/AppProvider'
import { propsAsync } from 'utils/async'

/**
 * @deprecated Use useDataLoader hook instead
 */
class DataLoader extends PureComponent {
  state = {
    loading: false,
    error: null,
  }

  async componentDidMount () {
    console.warn('DataLoader component is deprecated, please use `useDataLoader` hook or `withDataLoader` HoC instead')
    await this.loadAll(this.props.options.refetchOnMount)
  }

  async componentDidUpdate (prevProps) {
    // Data will be reloaded only if the "params" prop has changed
    if (!equals(prevProps.params, this.props.params)) {
      await this.loadAll()
    }
  }

  loadAll = async refetch => {
    this.setState({ loading: true }, async () => {
      const { loaders, getContext, setContext } = this.props
      try {
        await propsAsync(mapObjIndexed(loaderFn =>
          loaderFn({ getContext, setContext, refetch }), loaders,
        ))
        this.setState({ loading: false, error: null })
      } catch (err) {
        console.log(err)
        this.setState({ loading: false, error: err.toString() })
      }
    })
  }

  render () {
    const { loading, error } = this.state
    if (error) {
      return <DisplayError error={error} />
    }
    const { children, options, loaders, ...props } = this.props
    const reload = this.loadAll
    return <Progress inline={options.inlineProgress} overlay loading={loading}>
      {children({ ...props, loading, error, reload })}
    </Progress>
  }
}

DataLoader.propTypes = {
  /**
   * Object with key value pairs where key is the cacheKey and
   * value is a loaderFn or a spec of { requires, loaderFn }
   */
  loaders: PropTypes.object.isRequired,

  options: PropTypes.shape({
    inlineProgress: PropTypes.bool,
    refetchOnMount: PropTypes.bool,
  }),

  params: PropTypes.object,
}

DataLoader.defaultProps = {
  options: {
    inlineProgress: false,
    refetchOnMount: false,
  },
}

export default withAppContext(DataLoader)

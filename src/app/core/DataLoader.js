import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import DisplayError from './components/DisplayError'
import Progress from './components/Progress'
import { asyncProps } from 'utils/fp'
import { mapObjIndexed, equals } from 'ramda'

class DataLoader extends PureComponent {
  state = {
    loading: false,
    error: null,
  }

  async componentDidMount () {
    await this.loadAll(this.props.options.reloadOnMount)
  }

  async componentDidUpdate (prevProps) {
    // Data will be reloaded only if the "params" prop has changed
    if (!equals(prevProps.params, this.props.params)) {
      await this.loadAll()
    }
  }

  loadAll = async reload => {
    this.setState({ loading: true }, async () => {
      const { loaders, ...props } = this.props
      try {
        await asyncProps(mapObjIndexed(loader =>
          loader({ ...props, reload }), loaders,
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
    return <Progress inline={options.inlineProgress} overlay loading={loading}>
      {children({ ...props, loading, error })}
    </Progress>
  }
}

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

  params: PropTypes.object,
}

DataLoader.defaultProps = {
  options: {
    inlineProgress: false,
    reloadOnMount: false,
  },
}

export default DataLoader

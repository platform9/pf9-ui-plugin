import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { ensureArray } from 'app/utils/fp'
import DisplayError from './components/DisplayError'
import Progress from './components/Progress'
import { withAppContext } from 'core/AppContext'

class DataLoaderBase extends PureComponent {
  state = {
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
      const { loaders } = this.props
      try {
        await Promise.all(ensureArray(loaders).map(loader => loader(this.props)))
        this.setState({ loading: false })
      } catch (err) {
        console.log(err)
        this.setState({ loading: false, error: err.toString() })
      }
    })

  reloadData = (loaderFn, params, reload, cascade = false) => {
    this.setState({ loading: true }, async () => {
      try {
        await loaderFn({ ...this.props, params, reload, cascade })
        this.setState({ loading: false })
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
    const { children, options } = this.props
    return <Progress inline={options.inlineProgress} overlay loading={loading}>
      {children({ loading, error, reloadData: this.reloadData })}
    </Progress>
  }
}

// FIXME: for now we assign app context here but ideally this component
// should not be aware of anything about the app
const DataLoader = withAppContext(DataLoaderBase)

DataLoader.propTypes = {
  /**
   * Object with key value pairs where key is the dataKey and
   * value is a loaderFn or a spec of { requires, loaderFn }
   */
  loaders: PropTypes.oneOfType([PropTypes.array, PropTypes.func]).isRequired,

  options: PropTypes.shape({
    inlineProgress: PropTypes.bool,
  }),
}

DataLoader.defaultProps = {
  options: {},
}

export const withDataLoader = (loaders, options) => Component => props => (
  <DataLoader loaders={loaders} options={options}>
    {loaderProps => <Component {...loaderProps} {...props} />}
  </DataLoader>
)

export default DataLoader

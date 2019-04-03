import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { pick, intersection, flatten, head } from 'ramda'
import { ensureArray } from 'app/utils/fp'
import DisplayError from './components/DisplayError'
import Progress from './components/Progress'
import { withAppContext } from 'core/AppContext'
import moize from 'moize'

class MultiLoaderBase extends PureComponent {
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

  getLoaderPairs = loaders => Array.isArray(loaders)
    ? loaders
    : Object.entries(loaders)

  /**
   * Returns a map of [loaderKeys, promise] arrays that rely one on another and will wait for the
   * dependant loaders regardless of the order on which they are called
   * @param loaders
   */
  getLinkedLoaders = moize(loaders => {
    const loaderPairs = this.getLoaderPairs(loaders)
    const linkedLoaders = loaderPairs.map(([loaderKeys, loaderSpec]) => {
      const { loaderFn, requires } =
        typeof loaderSpec === 'function'
          ? { loaderFn: loaderSpec }
          : loaderSpec

      // If the loader has dependencies, create a promise that will wait for the dependencies to be resolved
      return [
        loaderKeys,
        async (params, reloadAll = true) => {
          const prevResults = requires
            ? await Promise.all(
              linkedLoaders
                .filter(([lnkLoaderKeys]) =>
                  intersection(lnkLoaderKeys, ensureArray(requires)).length > 0,
                )
                .map(([, loaderFn]) => loaderFn({ setContext, context, params, reload: reloadAll })),
            ) : undefined

          const { setContext, context } = this.props

          return loaderFn({ setContext, context, prevResults, params, reload: reloadAll })
        },
      ]
    })
    return linkedLoaders
  })

  loadAll = async () =>
    this.setState({ loading: true }, async () => {
      const { loaders } = this.props
      try {
        await Promise.all(this.getLinkedLoaders(loaders)
          .map(([, callback]) => callback()),
        )
        this.setState({ loading: false })
      } catch (err) {
        console.log(err)
        this.setState({ loading: false, error: err.toString() })
      }
    })

  loadOne = (key, params, reloadAll = false) => {
    const { loaders } = this.props
    const [, loaderFn] = this.getLinkedLoaders(loaders).find(([keys]) =>
      Array.isArray(keys) ? keys.includes(key) : keys === key,
    )

    this.setState({ loading: true }, async () => {
      try {
        await loaderFn(params, reloadAll)
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
    const { context, loaders, children, options } = this.props
    const loaderPairs = this.getLoaderPairs(loaders)
    const dataKeys = flatten(loaderPairs.map(head))
    const data = dataKeys.length === 1 ? context[dataKeys[0]] : pick(dataKeys, context)
    return <Progress inline={options.inlineProgress} overlay loading={loading || !data}>
      {children({ data, loading, error, context, reload: this.loadOne })}
    </Progress>
  }
}

const MultiLoader = withAppContext(MultiLoaderBase)

const DataLoader = ({ dataKey, loaderFn, children, options }) => (
  <MultiLoader loaders={[[ensureArray(dataKey), loaderFn]]} options={options}>
    {children}
  </MultiLoader>
)
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

MultiLoader.propTypes = {
  /**
   * Object with key value pairs where key is the dataKey and
   * value is a loaderFn or a spec of { requires, loaderFn }
   */
  loaders: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,

  options: PropTypes.shape({
    inlineProgress: PropTypes.bool,
  }),
}

MultiLoader.defaultProps = {
  options: {},
}

export const withDataLoader = ({ dataKey, loaderFn }, options) => Component => props => (
  <DataLoader dataKey={dataKey} loaderFn={loaderFn} options={options}>
    {loaderProps => <Component {...loaderProps} {...props} />}
  </DataLoader>
)

export const withMultiLoader = (loaders, options) => Component => props => (
  <MultiLoader loaders={loaders} options={options}>
    {loaderProps => <Component {...loaderProps} {...props} />}
  </MultiLoader>
)

export { MultiLoader }

export default DataLoader

import React from 'react'
import PropTypes from 'prop-types'
import DataLoader from 'core/DataLoader'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'

/* This is a convenience HOC to make updating the in-memory cache easier.
 * After updating we need to replace the in-memory cache that is normally an
 * array of items.  We do this by looping through the array and finding the
 * entity with `objId` and replacing it with the result of `updateFn`
 *
 * Additionally, it handles loading as well through `DataLoader`.
 */
class DataUpdater extends React.Component {
  findById = (arr, id) => arr.find(x => x.id === id)

  handleSubmit = async data => {
    const { dataKey, updateFn, objId, context, setContext } = this.props
    const updatedEntity = await updateFn(data)
    setContext({
      [dataKey]: context[dataKey].map(x => x.id === objId ? updatedEntity : x)
    })
  }

  render () {
    const { dataKey, loaderFn, objId, children } = this.props
    return (
      <DataLoader dataKey={dataKey} loaderFn={loaderFn}>
        {({ data }) =>
          children({
            data: this.findById(data, objId),
            onSubmit: this.handleSubmit
          })
        }
      </DataLoader>
    )
  }
}

DataUpdater.propTypes = {
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

  updateFn: PropTypes.func.isRequired,

  objId: PropTypes.string.isRequired,
}

export default compose(
  withAppContext,
)(DataUpdater)

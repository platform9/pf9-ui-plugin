import React from 'react'
import PropTypes from 'prop-types'
import { withAppContext } from 'core/AppContext'
import DataLoader from 'core/DataLoader'
import { compose } from 'ramda'
import { withRouter } from 'react-router'

/* This is a convenience HOC to make updating the in-memory cache easier.
 *
 * Additionally, it handles loading as well through `DataLoader`.
 */
class DataUpdater extends React.Component {
  findById = (arr = [], id) => arr.find(x => x.id === id)

  handleSubmit = async data => {
    const { updateFn, objId, backUrl, context, setContext, history } = this.props
    await updateFn({ data, context, setContext, objId })
    if (backUrl) {
      history.push(backUrl)
    }
  }

  render () {
    const { loaderFn, objId, children } = this.props
    return (
      <DataLoader loaders={loaderFn}>
        {({ data }) => {
          if (!data) { return null }
          return children({
            data: this.findById(data, objId),
            onSubmit: this.handleSubmit,
          })
        }}
      </DataLoader>
    )
  }
}

DataUpdater.propTypes = {
  /**
   * This function is invoked when the data does not yet exist.
   * It is passed `setContext` to use for updating.
   */
  loaderFn: PropTypes.func.isRequired,

  updateFn: PropTypes.func.isRequired,

  objId: PropTypes.string.isRequired,

  /**
   * Where to navigate to upon successful update.  Usually back
   * to the corresponding list page.
   */
  backUrl: PropTypes.string,
}

export default compose(
  withAppContext,
  withRouter,
)(DataUpdater)

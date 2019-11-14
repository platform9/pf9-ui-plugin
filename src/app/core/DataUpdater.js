import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withAppContext } from 'core/providers/AppProvider'
import DataLoader from 'core/DataLoader'
import { compose } from 'ramda'
import { withRouter } from 'react-router'

/**
 * This is a convenience HOC to make updating the in-memory cache easier.
 * Additionally, it handles loading as well through `DataLoader`.
 * @deprecated Use useDataUpdater hook instead
 */
class DataUpdater extends PureComponent {
  componentDidMount () {
    console.warn('DataUpdater component is deprecated, please use `useDataUpdater` hook instead')
  }

  findById = (arr = [], id) => arr.find(x => x.id === id)

  handleSubmit = async params => {
    const { updateFn, objId, backUrl, getContext, setContext, history } = this.props
    await updateFn({ params: { id: objId, ...params }, getContext, setContext, objId })
    if (backUrl) {
      history.push(backUrl)
    }
  }

  render () {
    const { loaderFn, objId, children } = this.props
    return (
      <DataLoader loaders={{ updaterData: loaderFn }}>
        {({ data }) => {
          if (!data.updaterData) { return null }
          return children({
            data: this.findById(data.updaterData, objId),
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

import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import CloudProvidersList from './CloudProvidersList'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'
import { withRouter } from 'react-router'

class CloudProvidersListContainer extends React.Component {
  handleRemove = async id => {
    const { context, setContext } = this.props
    await context.apiClient.qbert.deleteCloudProvider(id)
    const newCps = context.cloudProviders.filter(x => x.id !== id)
    setContext({ clusters: newCps })
  }

  render () {
    const rowActions = [
    ]

    return (
      <CRUDListContainer
        items={this.props.data}
        addUrl="/ui/kubernetes/infrastructure/cloudProviders/add"
        editUrl="/ui/kubernetes/infrastructure/cloudProviders/edit"
        onRemove={this.handleRemove}
      >
        {handlers => <CloudProvidersList data={this.props.data} {...handlers} rowActions={rowActions} />}
      </CRUDListContainer>
    )
  }
}

CloudProvidersListContainer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object)
}

export default compose(
  withAppContext,
  withRouter,
)(CloudProvidersListContainer)

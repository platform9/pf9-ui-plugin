import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import FlavorsList from './FlavorsList'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'

class FlavorsListContainer extends React.Component {
  handleRemove = async id => {
    const { flavors, setContext, context } = this.props
    const { nova } = context.openstackClient
    await nova.deleteFlavor(id)
    const newFlavors = flavors.filter(x => x.id !== id)
    await setContext({ flavors: newFlavors })
  }

  render () {
    return (
      <CRUDListContainer
        items={this.props.flavors}
        objType="flavors"
        addUrl="/ui/openstack/flavors/add"
        onRemove={this.handleRemove}
      >
        {handlers => <FlavorsList flavors={this.props.flavors} {...handlers} />}
      </CRUDListContainer>
    )
  }
}

FlavorsListContainer.propTypes = {
  flavors: PropTypes.arrayOf(PropTypes.object)
}

export default compose(
  withAppContext,
)(FlavorsListContainer)

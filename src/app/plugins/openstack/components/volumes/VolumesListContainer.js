import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import VolumesList from './VolumesList'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'

class VolumesListContainer extends React.Component {
  handleRemove = async id => {
    const { context, setContext } = this.props
    await context.openstackClient.cinder.deleteVolume(id)
    const newVolumes = context.volumes.filter(x => x.id !== id)
    setContext({ volumes: newVolumes })
  }

  render () {
    return (
      <CRUDListContainer
        items={this.props.volumes}
        addUrl="/ui/openstack/storage/volumes/add"
        editUrl="/ui/openstack/storage/volumes/edit"
        onRemove={this.handleRemove}
      >
        {handlers => <VolumesList volumes={this.props.volumes} {...handlers} />}
      </CRUDListContainer>
    )
  }
}

VolumesListContainer.propTypes = {
  volumes: PropTypes.arrayOf(PropTypes.object)
}

export default compose(
  withAppContext,
)(VolumesListContainer)

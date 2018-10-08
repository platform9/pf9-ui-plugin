import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import SshKeysList from './SshKeysList'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'
import { addIdsToCollection } from 'util/helpers'

const sshKeyUniqueIdentifier = 'name'

class SshKeysListContainer extends React.Component {
  handleRemove = async id => {
    const { sshKeys, setContext, context } = this.props
    const { nova } = context.apiClient
    await nova.deleteSshKey(id)
    const newSshKeys = sshKeys.filter(x => x[sshKeyUniqueIdentifier] !== id)
    setContext({ sshKeys: newSshKeys })
  }

  render () {
    const sshKeys = this.props.sshKeys ? addIdsToCollection(this.props.sshKeys) : []

    return (
      <CRUDListContainer
        items={sshKeys}
        objType="sshKeys"
        addUrl="/ui/openstack/sshkeys/add"
        onRemove={this.handleRemove}
        uniqueIdentifier={sshKeyUniqueIdentifier}
      >
        {({ onDelete, onAdd }) => (
          <SshKeysList
            sshKeys={sshKeys}
            onAdd={onAdd}
            onDelete={onDelete}
          />
        )}
      </CRUDListContainer>
    )
  }
}

SshKeysListContainer.propTypes = {
  sshKeys: PropTypes.arrayOf(PropTypes.object)
}

export default compose(
  withAppContext,
)(SshKeysListContainer)

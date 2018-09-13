import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import SshKeysList from './SshKeysList'
import { addIdsToCollection } from 'util/helpers'

class SshKeysListContainer extends React.Component {
  render () {
    const sshKeys = this.props.sshKeys ? addIdsToCollection(this.props.sshKeys) : []

    return (
      <CRUDListContainer
        items={sshKeys}
        objType="sshKeys"
        addUrl="/ui/openstack/sshkeys/add"
        uniqueIdentifier="name"
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

export default SshKeysListContainer

import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import SshKeysList from './SshKeysList'
import { GET_SSH_KEYS, REMOVE_SSH_KEY } from './actions'

class SshKeysListContainer extends React.Component {
  render () {
    return (
      <CRUDListContainer
        items={this.props.sshKeys}
        objType="sshKeys"
        getQuery={GET_SSH_KEYS}
        removeQuery={REMOVE_SSH_KEY}
        addUrl="/ui/openstack/sshkeys/add"
        uniqueIdentifier="name"
      >
        {({ onDelete, onAdd }) => (
          <SshKeysList
            sshKeys={this.props.sshKeys}
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

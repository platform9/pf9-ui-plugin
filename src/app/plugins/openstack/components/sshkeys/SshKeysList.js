import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'fingerprint', label: 'Fingerprint' },
  { id: 'public_key', label: 'Public Key' },
]

class SshKeysList extends React.Component {
  render () {
    const { onAdd, onDelete, sshKeys } = this.props

    if (!sshKeys || sshKeys.length === 0) {
      return (<h1>No SSH Keys found</h1>)
    }

    return (
      <ListTable
        title="SSH Keys"
        columns={columns}
        data={sshKeys}
        onAdd={onAdd}
        onDelete={onDelete}
        searchTarget="name"
      />
    )
  }
}

SshKeysList.propTypes = {
  /** List of ssh keys [{ name, fingerprint, public_key, ... }] */
  sshKeys: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a row */
  onDelete: PropTypes.func.isRequired,
}

SshKeysList.defaultProps = {
  sshKeys: [],
}

export default SshKeysList

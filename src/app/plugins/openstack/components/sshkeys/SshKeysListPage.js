import React from 'react'
import { compose, graphql } from 'react-apollo'

import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import SshKeysListContainer from './SshKeysListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_SSH_KEYS } from './actions'
import { addIdsToCollection } from '../../../../util/helpers'

const SshKeysPage =
  ({ data, loading, error }) => {
    return (
      <div>
        <h1>SSH Keys Page</h1>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {data && data.sshKeys && <SshKeysListContainer sshKeys={addIdsToCollection(data.sshKeys)} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_SSH_KEYS),
)(SshKeysPage)

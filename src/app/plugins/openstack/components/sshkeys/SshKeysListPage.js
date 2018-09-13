import React from 'react'
import { compose } from 'react-apollo'
import SshKeysListContainer from './SshKeysListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { loadSshKeys } from './actions'

const SshKeysListPage = () =>
  <DataLoader dataKey="sshKeys" loaderFn={loadSshKeys}>
    {({ data }) => <SshKeysListContainer sshKeys={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(SshKeysListPage)

import React, { FunctionComponent } from 'react'
import Loading from 'core/components/Loading'

const iconColors = new Map<string, 'primary' | 'secondary' | 'disabled'>([
  ['creating', 'secondary'],
  ['updating', 'primary'],
  ['deleting', 'disabled'],
  ['upgrading', 'primary'],
])

const ClusterSync: FunctionComponent<{ taskStatus: string }> = ({ children, taskStatus }) => {
  return (
    <Loading color={iconColors.get(taskStatus)}>
      {children}
    </Loading>
  )
}

export default ClusterSync

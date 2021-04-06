import useDataLoader from 'core/hooks/useDataLoader'
import React from 'react'
import useReactRouter from 'use-react-router'
import { virtualMachineDetailsLoader } from './actions'

const VirtualMachineDetailPage = () => {
  const { match } = useReactRouter()
  const { clusterId, namespace, name } = match?.params || {}
  const [vm, loading, reload] = useDataLoader(virtualMachineDetailsLoader, {
    clusterId,
    namespace,
    name,
  }) as any

  debugger

  return null
}

export default VirtualMachineDetailPage

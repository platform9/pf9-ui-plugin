import React from 'react'
import EnpointsListPage from './endpoints/EndpointsListPage'
import KubeConfigListPage from './kubeConfig/KubeConfigListPage'
import { Divider } from '@material-ui/core'

const ApiAccessListPage = () =>
  <>
    <EnpointsListPage />
    <Divider />
    <KubeConfigListPage />
  </>

export default ApiAccessListPage

import React from 'react'
import EnpointsListPage from './endpoints/EndpointsListPage'
import KubeConfigListPage from './kubeConfig/KubeConfigListPage'

const ApiAccessListPage = () =>
  <>
    <EnpointsListPage />
    <KubeConfigListPage />
  </>

export default ApiAccessListPage

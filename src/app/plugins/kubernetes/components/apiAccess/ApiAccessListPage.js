import React from 'react'
import EnpointsListPage from './endpoints/EndpointsListPage'
import KubeConfigListPage from './kubeConfig/KubeConfigListPage'
import { makeStyles } from '@material-ui/core/styles'
import { Divider } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: 700,
  },
}))

const ApiAccessListPage = () => {
  const { container } = useStyles()
  return (
    <div className={container}>
      <EnpointsListPage />
      <Divider />
      <KubeConfigListPage />
    </div>
  )
}

export default ApiAccessListPage

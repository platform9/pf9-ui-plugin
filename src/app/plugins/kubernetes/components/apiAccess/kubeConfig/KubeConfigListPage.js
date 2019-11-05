import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import kubeConfigActions from './actions'

const useStyles = makeStyles(theme => ({
  link: {
    display: 'inline-block',
    marginTop: theme.spacing(5),
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    }
  }
}))

const KubeConfigListPage = () => {
  const classes = useStyles()
  const columns = getColumns()

  const options = {
    cacheKey: 'kubeconfig',
    uniqueIdentifier: 'cluster',
    loaderFn: kubeConfigActions.list,
    columns,
    name: 'Kubeconfig',
    compactTable: true,
  }

  const { ListPage } = createCRUDComponents(options)

  return (
    <>
      <h2>Download kubeconfig</h2>
      <p>The kubeconfig file is required to authenticate with a cluster and switch between multiple clusters between multiple users while using the kubectl command line.</p>
      <a className={classes.link} href="https://kubernetes.io/docs/user-guide/kubectl-overview/">
        Learn more about kubectl
      </a>
      <a className={classes.link} href="https://kubernetes.io/docs/user-guide/kubeconfig-file/">
        Learn more about kubeconfig
      </a>
      <ListPage />
    </>
  )
}

const getColumns = () => [
  { id: 'cluster', label: 'Cluster' },
  { id: 'kubeConfig', label: 'kubeconfig', render: (value) => kubeConfigLink(value) },
  { id: 'url', label: 'URL' },
]

// TODO: implement kubebonfig link
const kubeConfigLink = (value) =>
  <a href='#'>Download kubeconfig</a>

export default KubeConfigListPage

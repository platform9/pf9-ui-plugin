import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import kubeConfigActions from './actions'

const useStyles = makeStyles(theme => ({
  link: {
    display: 'block',
    width: 'fit-content',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    }
  },
  clusterConfig: {
    marginTop: theme.spacing(5),
  },
}))

const KubeConfigListPage = () => {
  const classes = useStyles()

  const options = {
    cacheKey: 'kubeconfig',
    uniqueIdentifier: 'cluster',
    loaderFn: kubeConfigActions.list,
    columns,
    name: 'Kubeconfig',
    compactTable: true,
    blankFirstColumn: true,
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
      <p className={classes.clusterConfig}>Select a cluster above to populate its kubeconfig below.</p>
    </>
  )
}

const columns = [
  { id: 'cluster', label: 'Cluster' },
  { id: 'kubeConfig', label: 'kubeconfig', render: (value) => kubeConfigLink(value) },
  { id: 'url', label: 'URL' },
]

// TODO: implement kubebonfig link
const kubeConfigLink = (value) =>
  <a href='#'>Download kubeconfig</a>

export default KubeConfigListPage

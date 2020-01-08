import React, { useMemo, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import kubeConfigActions from './actions'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import DownloadDialog from './DownloadDialog'
import SimpleLink from 'core/components/SimpleLink'
import useToggler from 'core/hooks/useToggler'
import ApiClient from 'api-client/ApiClient'
import ExternalLink from 'core/components/ExternalLink'
import useDataLoader from 'core/hooks/useDataLoader'

const { qbert } = ApiClient.getInstance()

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(3),
    '& h6': {
      marginLeft: 0,
    }
  },
  link: {
    display: 'block',
    width: 'fit-content',
  },
  clusterConfig: {
    marginTop: theme.spacing(5),
  },
  tableContainer: {
    minHeight: ({ loading }) => loading ? theme.spacing(35) : theme.spacing(),
  },
}))

const KubeConfigListPage = () => {
  const [isDialogOpen, toggleDialog] = useToggler()
  const [selectedCluster, setSelectedCluster] = useState()
  const [downloadedKubeconfigs, setDownloadedKubeconfigs] = useState({})
  const [currentKubeconfig, setCurrentKubeconfig] = useState('')

  const [clusters, loadingClusters] = useDataLoader(kubeConfigActions.list)
  const classes = useStyles({ loading: loadingClusters })

  const onSelect = (row) => {
    setSelectedCluster({ id: row.clusterId, name: row.cluster })
    const kubeconfig = downloadedKubeconfigs[row.clusterId]

    if (kubeconfig) {
      setCurrentKubeconfig(kubeconfig)
    } else {
      toggleDialog()
    }
  }

  const handleDownloadYamlFileClick = (clusterId, clusterName) => {
    setSelectedCluster({ id: clusterId, name: clusterName })
    const kubeconfig = downloadedKubeconfigs[clusterId]

    if (kubeconfig) {
      downloadYamlFile(clusterName, kubeconfig)
    } else {
      toggleDialog()
    }
  }

  const downloadYamlFile = (clusterName, kubeconfig) => {
    const blob = new Blob([kubeconfig], { type: 'application/octet-stream' })
    const elem = window.document.createElement('a')
    elem.href = window.URL.createObjectURL(blob)
    elem.download = `${clusterName}.yml`
    document.body.appendChild(elem)
    elem.click()
    document.body.removeChild(elem)
  }

  const columns = getColumns(handleDownloadYamlFileClick)

  const options = useMemo(() => ({
    cacheKey: 'kubeconfig',
    uniqueIdentifier: 'cluster',
    loaderFn: kubeConfigActions.list,
    columns,
    name: 'Kubeconfig',
    compactTable: true,
    blankFirstColumn: true,
    multiSelection: false,
    onSelect,
    emptyText: 'There are no available clusters from which you can download a kubeconfig',
  }), [toggleDialog, downloadedKubeconfigs, currentKubeconfig])

  const downloadKubeconfig = async (cluster, token) => {
    const kubeconfig = await qbert.getKubeConfig(cluster.id)
    const kubeconfigWithToken = kubeconfig.replace('__INSERT_BEARER_TOKEN_HERE__', token)
    setDownloadedKubeconfigs({
      ...downloadedKubeconfigs,
      [cluster.id]: kubeconfigWithToken,
    })
    setCurrentKubeconfig(kubeconfigWithToken)
    toggleDialog()
    downloadYamlFile(cluster.name, kubeconfigWithToken)
  }

  const { ListPage } = createCRUDComponents(options)

  return (
    <section className={classes.container}>
      <h2>Download kubeconfig</h2>
      <p>The kubeconfig file is required to authenticate with a cluster and switch between multiple clusters between multiple users while using the kubectl command line.</p>
      <ExternalLink className={classes.link} url="https://kubernetes.io/docs/user-guide/kubectl-overview/">
        Learn more about kubectl
      </ExternalLink>
      <ExternalLink className={classes.link} url="https://kubernetes.io/docs/user-guide/kubeconfig-file/">
        Learn more about kubeconfig
      </ExternalLink>
      <div className={classes.tableContainer}>
        <ListPage overlayProgress={false} />
      </div>
      { !loadingClusters && clusters.length > 0 && <>
        <p className={classes.clusterConfig}>Select a cluster above to populate its kubeconfig below.</p>
        <ValidatedForm>
          <TextField id="config" value={currentKubeconfig} rows={9} multiline />
        </ValidatedForm>
        <DownloadDialog
          onDownloadClick={(token) => downloadKubeconfig(selectedCluster, token)}
          onClose={toggleDialog}
          isDialogOpen={isDialogOpen}
        />
      </>
      }
    </section>
  )
}

const getColumns = (handleDownloadYamlFileClick) => [
  { id: 'cluster', label: 'Cluster' },
  {
    id: 'kubeConfig',
    label: 'kubeconfig',
    render: (contents, row) => kubeConfigLink(row, handleDownloadYamlFileClick),
  },
  { id: 'url', label: 'URL' },
]

const kubeConfigLink = (row, handleDownloadYamlFileClick) =>
  <SimpleLink onClick={() => handleDownloadYamlFileClick(row.clusterId, row.cluster)}>Download kubeconfig</SimpleLink>

export default KubeConfigListPage

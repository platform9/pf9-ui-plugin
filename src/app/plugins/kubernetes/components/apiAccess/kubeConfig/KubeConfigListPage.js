import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Radio,
  Typography,
} from '@material-ui/core'
import kubeConfigActions from './actions'
import DownloadKubeConfigForm from './DownloadKubeConfigForm'
import SimpleLink from 'core/components/SimpleLink'
import ApiClient from 'api-client/ApiClient'
import ExternalLink from 'core/components/ExternalLink'
import { OnboardingAccessSetup } from 'app/constants'
import useDataLoader from 'core/hooks/useDataLoader'
import Progress from 'core/components/progress/Progress'
import { pathToCreateCluster } from 'app/core/utils/routes'
import CodeBlock from 'core/components/CodeBlock'
import CopyToClipboard from 'core/components/CopyToClipboard'

const { qbert } = ApiClient.getInstance()

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(3),
    '& h6': {
      marginLeft: 0,
    },
  },
  detail: {
    display: 'flex',
    flexWrap: 'wrap',
    '& a': {
      margin: theme.spacing(0, 0.5),
    },
  },
  link: {
    display: 'block',
    width: 'fit-content',
  },
  clusterConfig: {
    margin: theme.spacing(2, 0),
  },
  tableContainer: {
    border: 'none',
    marginBottom: theme.spacing(2),
  },
  noClusters: {
    border: 'none',
    '& td': {
      border: 'none',
      '& > div': {
        display: 'flex',
        alignItems: 'center',
      },
    },
  },
}))

const KubeConfigListPage = () => {
  const [selectedCluster, setSelectedCluster] = useState()
  const [downloadedKubeconfigs, setDownloadedKubeconfigs] = useState({})
  const [errorMessage, setErrorMessage] = useState()

  const [clusters, loadingClusters] = useDataLoader(kubeConfigActions.list)
  const classes = useStyles()

  const downloadYamlFile = (clusterName, kubeconfig) => {
    const blob = new Blob([kubeconfig], { type: 'application/octet-stream' })
    const elem = window.document.createElement('a')
    elem.href = window.URL.createObjectURL(blob)
    elem.download = `${clusterName}.yml`
    document.body.appendChild(elem)
    elem.click()
    document.body.removeChild(elem)
  }

  const handleKubeconfigAction = (clusterName, kubeconfigWithToken) => {
    downloadYamlFile(clusterName, kubeconfigWithToken)
    localStorage.setItem(OnboardingAccessSetup, 'true')
  }

  const downloadKubeconfig = async (cluster, token) => {
    setErrorMessage(null)

    if (downloadedKubeconfigs[cluster.clusterId]) {
      handleKubeconfigAction(cluster.cluster, downloadedKubeconfigs[cluster.clusterId])
      return
    }

    try {
      const kubeconfig = await qbert.getKubeConfig(cluster.clusterId)
      const kubeconfigWithToken = kubeconfig.replace('__INSERT_BEARER_TOKEN_HERE__', token)
      setDownloadedKubeconfigs({
        ...downloadedKubeconfigs,
        [cluster.clusterId]: kubeconfigWithToken,
      })
      handleKubeconfigAction(cluster.cluster, kubeconfigWithToken)
    } catch (e) {
      const message = e.message || 'An error occoured while trying to download the kubeconfig.'
      setErrorMessage(message)
    }
  }

  return (
    <section className={classes.container}>
      <h2>Download kubeconfig</h2>
      <span className={classes.detail}>
        <span>To authenticate with a cluster you need a</span>
        <ExternalLink
          className={classes.link}
          url="https://kubernetes.io/docs/user-guide/kubeconfig-file/"
        >
          kubeconfig
        </ExternalLink>
        <span>file. Used in conjunction with the</span>
        <ExternalLink
          className={classes.link}
          url="https://kubernetes.io/docs/user-guide/kubectl-overview/"
        >
          kubectl
        </ExternalLink>
        <span>command line, you can switch between multiple clusters and users</span>
      </span>
      <Progress loading={loadingClusters}>
        <div>
          <h4 className={classes.clusterConfig}>Select a cluster to continue.</h4>
          <Table className={classes.tableContainer}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Cluster</TableCell>
                <TableCell>URL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clusters.length === 0 && (
                <TableRow className={classes.noClusters}>
                  <TableCell colSpan={3} align="left">
                    <div>
                      <Typography variant="body1">
                        There are no clusters available. You need to{' '}
                        <SimpleLink src={pathToCreateCluster()}>create a cluster</SimpleLink> first
                        to continue.
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {clusters.map((cluster = {}) => (
                <TableRow key={cluster.clusterId} onClick={() => setSelectedCluster(cluster)}>
                  <TableCell padding="checkbox">
                    <Radio
                      checked={!!selectedCluster && selectedCluster.clusterId === cluster.clusterId}
                    />
                  </TableCell>
                  <TableCell>{cluster.cluster}</TableCell>
                  <TableCell>{cluster.url}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Progress>
      {!!selectedCluster && !downloadedKubeconfigs[selectedCluster.clusterId] && (
        <DownloadKubeConfigForm
          onSubmit={(token) => downloadKubeconfig(selectedCluster, token)}
          apiError={errorMessage}
        />
      )}
      {!!selectedCluster && downloadedKubeconfigs[selectedCluster.clusterId] && (
        <CopyToClipboard copyText={downloadedKubeconfigs[selectedCluster.clusterId]} inline={false} header={selectedCluster.cluster}>
          <CodeBlock>{downloadedKubeconfigs[selectedCluster.clusterId]}</CodeBlock>
        </CopyToClipboard>
      )}
    </section>
  )
}

export default KubeConfigListPage

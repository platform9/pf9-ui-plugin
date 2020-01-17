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
import ExternalLink from 'core/components/ExternalLink'
import { OnboardingAccessSetup } from 'app/constants'
import useDataLoader from 'core/hooks/useDataLoader'
import Progress from 'core/components/progress/Progress'
import { pathToCreateCluster } from 'app/core/utils/routes'
import CodeBlock from 'core/components/CodeBlock'
import CopyToClipboard from 'core/components/CopyToClipboard'

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

  const [clusters, loadingClusters] = useDataLoader(kubeConfigActions.list)
  const classes = useStyles()

  const handleDownloadKubeConfig = cluster => kubeconfig => {
    setDownloadedKubeconfigs({
      ...downloadedKubeconfigs,
      [cluster.uuid]: kubeconfig,
    })

    localStorage.setItem(OnboardingAccessSetup, 'true')
  }

  return (
    <section className={classes.container}>
      <h2>Download kubeconfig</h2>
      <span className={classes.detail}>
        <span>The</span>
        <ExternalLink
          className={classes.link}
          url="https://kubernetes.io/docs/user-guide/kubeconfig-file/"
        >
          kubeconfig
        </ExternalLink>
        <span>file is required to authenticate to a cluster using the </span>
        <ExternalLink
          className={classes.link}
          url="https://kubernetes.io/docs/user-guide/kubectl-overview/"
        >
          kubectl
        </ExternalLink>
        <span>CLI, Octant, Kubernetes Dashboard, and other clients.</span>
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
                <TableRow key={cluster.uuid} onClick={() => setSelectedCluster(cluster)}>
                  <TableCell padding="checkbox">
                    <Radio
                      checked={!!selectedCluster && selectedCluster.uuid === cluster.uuid}
                    />
                  </TableCell>
                  <TableCell>{cluster.name}</TableCell>
                  <TableCell>{cluster.externalDnsName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Progress>
      {!!selectedCluster && !downloadedKubeconfigs[selectedCluster.uuid] && (
        <DownloadKubeConfigForm
          cluster={selectedCluster}
          onSubmit={handleDownloadKubeConfig(selectedCluster)}
        />
      )}
      {!!selectedCluster && downloadedKubeconfigs[selectedCluster.uuid] && (
        <CopyToClipboard copyText={downloadedKubeconfigs[selectedCluster.uuid]} inline={false} header={selectedCluster.name}>
          <CodeBlock>{downloadedKubeconfigs[selectedCluster.uuid]}</CodeBlock>
        </CopyToClipboard>
      )}
    </section>
  )
}

export default KubeConfigListPage

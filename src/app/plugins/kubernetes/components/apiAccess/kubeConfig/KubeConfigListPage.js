import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Radio, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core'
import Text from 'core/elements/text'
import { kubeconfigFileLink } from 'k8s/links'
import DownloadKubeConfigForm from './DownloadKubeConfigForm'
import SimpleLink from 'core/components/SimpleLink'
import ExternalLink from 'core/components/ExternalLink'
import { codeMirrorOptions, onboardingAccessSetup } from 'app/constants'
import useDataLoader from 'core/hooks/useDataLoader'
import { routes } from 'app/core/utils/routes'
import CopyToClipboard from 'core/components/CopyToClipboard'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import PollingData from 'core/components/PollingData'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import CodeMirror from 'core/components/validatedForm/CodeMirror'

const useStyles = makeStyles((theme) => ({
  root: {
    width: 715,
  },
  formCard: {
    marginTop: theme.spacing(0.5),
  },
  submit: {
    display: 'flex',
    marginLeft: theme.spacing(2),
  },
  blueIcon: {
    color: theme.palette.primary.main,
  },
  container: {
    paddingLeft: theme.spacing(),
  },
  detail: {
    marginTop: theme.spacing(),
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
  yamlContainer: {
    flexFlow: 'column nowrap',
  },
}))

const KubeConfigListPage = () => {
  const [selectedCluster, setSelectedCluster] = useState()
  const [downloadedKubeconfigs, setDownloadedKubeconfigs] = useState({})

  const [clusters, loadingClusters, reloadClusters] = useDataLoader(clusterActions.list)
  const classes = useStyles()

  const handleDownloadKubeConfig = (cluster) => (kubeconfig) => {
    setDownloadedKubeconfigs({
      ...downloadedKubeconfigs,
      [cluster.uuid]: kubeconfig,
    })
    localStorage.setItem(onboardingAccessSetup, 'true')
  }
  return (
    <section className={classes.root}>
      <PollingData
        loading={loadingClusters}
        onReload={reloadClusters}
        refreshDuration={1000 * 60 * 10}
      />
      <FormFieldCard
        title="Download kubeconfig"
        className={classes.formCard}
        link={
          <div>
            <FontAwesomeIcon className={classes.blueIcon} size="md">
              lock
            </FontAwesomeIcon>{' '}
            <ExternalLink url={kubeconfigFileLink}>KubeConfig & Client Help</ExternalLink>
          </div>
        }
      >
        <div className={classes.container}>
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
                      <Text variant="body1">
                        There are no clusters available. You need to{' '}
                        <SimpleLink src={routes.cluster.add.path()}>create a cluster</SimpleLink>{' '}
                        first to continue.
                      </Text>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {clusters.map((cluster = {}) => (
                <TableRow key={cluster.uuid} onClick={() => setSelectedCluster(cluster)}>
                  <TableCell padding="checkbox">
                    <Radio checked={!!selectedCluster && selectedCluster.uuid === cluster.uuid} />
                  </TableCell>
                  <TableCell>{cluster.name}</TableCell>
                  <TableCell>{cluster.externalDnsName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!!selectedCluster && !downloadedKubeconfigs[selectedCluster.uuid] && (
            <DownloadKubeConfigForm
              cluster={selectedCluster}
              onSubmit={handleDownloadKubeConfig(selectedCluster)}
            />
          )}
          {!!selectedCluster && downloadedKubeconfigs[selectedCluster.uuid] && (
            <ValidatedForm classes={{ root: classes.yamlContainer }} elevated={false}>
              <CodeMirror
                id="kubeconfigYaml"
                label={
                  <CopyToClipboard
                    copyText={downloadedKubeconfigs[selectedCluster.uuid]}
                    inline={true}
                    codeBlock={false}
                  >
                    {selectedCluster.name}
                  </CopyToClipboard>
                }
                copyText={downloadedKubeconfigs[selectedCluster.uuid]}
                options={codeMirrorOptions}
                value={downloadedKubeconfigs[selectedCluster.uuid]}
              />
            </ValidatedForm>
          )}
        </div>
      </FormFieldCard>
    </section>
  )
}

export default KubeConfigListPage

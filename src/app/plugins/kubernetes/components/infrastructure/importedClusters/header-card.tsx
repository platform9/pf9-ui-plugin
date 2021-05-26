import React, { FC, useMemo } from 'react'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/styles'
import { Card, Tooltip } from '@material-ui/core'
import Text from 'core/elements/text'
import ExternalLink from 'core/components/ExternalLink'
import { ImportedClusterSelector, importedClusterStatusMap } from './model'
import useDataLoader from 'core/hooks/useDataLoader'
import { IUseDataLoader } from '../nodes/model'
import { ClusterTag } from 'api-client/appbert.model'
import { clusterTagActions } from '../clusters/actions'
import { useSelector } from 'react-redux'
import { pathOr } from 'ramda'
import { clientStoreKey } from 'core/client/clientReducers'
import ClusterStatusSpan from '../clusters/ClusterStatus'
import Alert from 'core/components/Alert'

const getGrafanaUrl = (host, cluster) =>
  `${host}/k8s/v1/clusters/${cluster.uuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:grafana-ui:80/proxy/`

const HeaderCard: FC<{ title: string; cluster: ImportedClusterSelector }> = ({
  title,
  cluster,
  children,
}) => {
  const classes = useStyles()
  const [clusterTags]: IUseDataLoader<ClusterTag> = useDataLoader(clusterTagActions.list) as any
  const baseEndpoint = useSelector(pathOr('', [clientStoreKey, 'endpoints', 'qbert'])).match(
    /(.*?)\/qbert/,
  )[1]
  const enabled = useMemo(() => {
    if (clusterTags?.length) {
      const clusterPackages = clusterTags.find((item) => {
        return item.uuid === cluster.uuid
      })
      if (!clusterPackages) {
        return false
      }
      const monitoringPackage = clusterPackages.pkgs.find((pkg) => {
        return pkg.name === 'pf9-mon'
      })
      return monitoringPackage?.installed
    }
    return false
  }, [clusterTags])

  const providerType = cluster?.metadata?.labels?.provider
  const privateAccess = cluster?.spec?.[providerType]?.network?.vpc?.privateAccess
  // Confirming with backend regarding vpc for aks cluster
  const publicAccess =
    cluster?.spec?.[providerType]?.network?.vpc?.publicAccess || cluster.providerType === 'aks'
  const isPublicPrivateVpc = privateAccess === true && publicAccess === true
  const isPrivateVpc = privateAccess === true && publicAccess === false
  const vpcText = `${publicAccess === true ? 'Public' : ''}${isPublicPrivateVpc ? ' + ' : ''}${
    privateAccess === true ? 'Private' : ''
  } VPC`

  const phase = cluster?.status?.phase
  const hasApiServer = cluster?.status?.controlPlaneEndpoint
  return (
    <Card className={classes.container} elevation={0}>
      <header className={classes.header}>
        <Tooltip title={title} interactive>
          <Text variant="subtitle1" component="h1">
            {title}
          </Text>
        </Tooltip>
      </header>
      <article className={classes.article}>
        <Text variant="body2" className={classes.uppercase}>
          {providerType} - {cluster?.kubeVersion}
        </Text>
        <Text variant="body2">{vpcText}</Text>
        <Text variant="body2" className={classes.capitalize}>
          {cluster.region}
        </Text>
      </article>
      {isPrivateVpc && (
        <Alert
          small
          type="card"
          variant="info"
          message="The cluster's API server is private; all actions are disabled and workload information is not available."
        />
      )}
      <footer className={classes.footer}>
        {!isPrivateVpc && (
          <div>
            <ClusterStatusSpan
              title={phase}
              variant="table"
              status={importedClusterStatusMap[phase]}
            >
              {phase}
            </ClusterStatusSpan>
            <ClusterStatusSpan
              title="Api Server Connected"
              variant="table"
              status={hasApiServer ? 'ok' : 'fail'}
            >
              Api Server Connected
            </ClusterStatusSpan>
          </div>
        )}
        {enabled && !isPrivateVpc && (
          <ExternalLink
            icon="chart-line"
            className={classes.grafanaLink}
            url={getGrafanaUrl(baseEndpoint, cluster)}
          >
            Grafana
          </ExternalLink>
        )}
      </footer>
    </Card>
  )
}

export default HeaderCard

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    width: 424,
    minHeight: 210,
    display: 'grid',
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.grey['000'],
    border: `solid 1px ${theme.palette.grey[300]}`,
    borderRadius: 4,
  },
  header: {
    color: theme.palette.grey[700],
    padding: theme.spacing(1, 2),
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    display: 'flex',
    alignItems: 'center',
  },
  article: {
    padding: theme.spacing(1, 3),
  },
  footer: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    padding: theme.spacing(0, 3, 1, 3),
  },
  grafanaLink: {
    ...theme.typography.body2,
    marginTop: 4,
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
}))

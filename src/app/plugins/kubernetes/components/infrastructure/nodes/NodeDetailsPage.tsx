// Libs
import React, { useMemo, FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Typography, Theme, Card, CardHeader, CardContent, Grid } from '@material-ui/core'
import useReactRouter from 'use-react-router'
// Actions
import useDataLoader from 'core/hooks/useDataLoader'
import { loadNodes } from './actions'
// Components
import PageContainer from 'core/components/pageContainer/PageContainer'
// Models
import { ICombinedNode } from './model'
import SimpleLink from 'core/components/SimpleLink'
import Progress from 'core/components/progress/Progress'
import UsageWidget from 'core/components/widgets/UsageWidget'
import calcUsageTotals from 'k8s/util/calcUsageTotals'
import ExternalLink from 'core/components/ExternalLink'
import HelpContainer from 'core/components/HelpContainer'
import { routes } from 'core/utils/routes'
import partition from 'ramda/es/partition'

const isPrimaryNetwork = (primaryNetwork) => ([name, ip]) => ip === primaryNetwork

export const orderInterfaces = (
  networkInterfaces: { [key: string]: string },
  primaryNetwork: string,
) => {
  return [].concat(
    ...partition(isPrimaryNetwork(primaryNetwork), Object.entries(networkInterfaces)),
  )
}

// Styles
const useStyles = makeStyles((theme: Theme) => ({
  backLink: {
    marginBottom: theme.spacing(2),
    marginLeft: 'auto',
  },
  detailContainer: {
    display: 'flex',
    marginTop: theme.spacing(2),
  },
  rowHelp: {
    width: 24,
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  rowValue: {
    marginLeft: theme.spacing(0.5),
  },
  card: {
    marginRight: theme.spacing(2),
  },
}))

const ClusterDetailsPage: FC = () => {
  const { match } = useReactRouter()
  const classes = useStyles({})
  const [nodes, loading] = useDataLoader(loadNodes)
  const selectedNode: ICombinedNode = nodes.find(
    (x: ICombinedNode) => x.uuid === match.params.id
  ) || {}

  const totals = useMemo(
    () => ({
      compute: calcUsageTotals(
        [selectedNode],
        'combined.usage.compute.current',
        'combined.usage.compute.max',
      ),
      memory: calcUsageTotals(
        [selectedNode],
        'combined.usage.memory.current',
        'combined.usage.memory.max',
      ),
      disk: calcUsageTotals(
        [selectedNode],
        'combined.usage.disk.current',
        'combined.usage.disk.max',
      ),
    }),
    [selectedNode],
  )

  return (
    <PageContainer
      header={
        <>
          <Typography variant="h5">Node {selectedNode.name}</Typography>
          <SimpleLink src={routes.nodes.list.path()} className={classes.backLink}>
            « Back to Node List
          </SimpleLink>
        </>
      }
    >
      <Progress loading={loading} message="Loading Nodes..." minHeight={200}>
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <UsageWidget
              title="Compute"
              stats={totals.compute}
              units="GHz"
              headerImg={'/ui/images/icon-compute.svg'}
            />
          </Grid>
          <Grid item xs={4}>
            <UsageWidget
              title="Memory"
              stats={totals.memory}
              units="GiB"
              headerImg={'/ui/images/icon-memory.svg'}
            />
          </Grid>
          <Grid item xs={4}>
            <UsageWidget
              title="Storage"
              stats={totals.disk}
              units="GiB"
              headerImg={'/ui/images/icon-storage.svg'}
            />
          </Grid>
        </Grid>
        <NodeDetail {...selectedNode} />
      </Progress>
    </PageContainer>
  )
}

const NodeDetail: FC<ICombinedNode> = (node) => {
  const { uuid, combined, logs, clusterName, clusterUuid } = node
  const { detailContainer, card } = useStyles({})
  const hostId = uuid
  const roles = combined?.roles
  const operatingSystem = combined?.resmgr?.info?.os_info || combined?.osInfo
  const primaryNetwork = combined?.qbert?.primaryIp
  const networkInterfaces = combined?.networkInterfaces || {}
  const CPUArchitecture = combined?.resmgr?.info?.arch

  const orderedInterfaces = orderInterfaces(networkInterfaces, primaryNetwork)

  return (
    <div className={detailContainer}>
      <Card className={card}>
        <CardHeader title="Misc" />
        <CardContent>
          <table>
            <tbody>
              <DetailRow
                label="Node UUID"
                value={hostId}
                helpMessage="This is the unique ID that PMK as assigned to this node"
              />
              <DetailRow label="CPU Architecture" value={CPUArchitecture} />
              <DetailRow label="Operating System" value={operatingSystem} />
              {!!clusterName && <DetailRow label="Cluster info" value={<SimpleLink src={routes.cluster.detail.path({ id: clusterUuid })}>{clusterName}</SimpleLink>} />}
              <DetailRow label="Roles" value={roles} />
              <DetailRow label="Logs" value={<ExternalLink url={logs}>View Logs</ExternalLink>} />
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Network Interfaces" />
        <CardContent>
          <table>
            <tbody>
              {orderedInterfaces.map(([interfaceName, interfaceIp]) => (
                <DetailRow
                  key={interfaceIp}
                  label={
                    interfaceIp === primaryNetwork ? `${interfaceName} (primary)` : interfaceName
                  }
                  value={interfaceIp}
                />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

const DetailRow: FC<{ label: string, value: string | React.ReactNode, helpMessage?: string }> = ({
  label,
  value,
  helpMessage,
}) => {
  const { rowHeader, rowValue, rowHelp } = useStyles({})
  return (
    <tr>
      <td>
        <Typography className={rowHeader} variant="subtitle2">
          {label}:
        </Typography>
      </td>
      <td>
        { typeof value === 'string' ? <Typography className={rowValue}>{value}</Typography> : value }
      </td>
      <td className={rowHelp}>
        {!!helpMessage && <HelpContainer title={helpMessage} color="black" />}
      </td>
    </tr>
  )
}

export default ClusterDetailsPage

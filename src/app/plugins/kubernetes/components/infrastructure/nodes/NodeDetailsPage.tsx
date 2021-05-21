// Libs
import React, { useMemo, FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import useReactRouter from 'use-react-router'
// Actions
import useDataLoader from 'core/hooks/useDataLoader'
import { loadNodes } from './actions'
// Components
import PageContainer from 'core/components/pageContainer/PageContainer'
// Models
import { ErrorMessageCodes, INodesSelector } from './model'
import SimpleLink from 'core/components/SimpleLink'
import Progress from 'core/components/progress/Progress'
import UsageWidget from 'core/components/widgets/UsageWidget'
import calcUsageTotalByPath from 'k8s/util/calcUsageTotals'
import HelpContainer from 'core/components/HelpContainer'
import { routes } from 'core/utils/routes'
import Theme from 'core/themes/model'
import NodeInfo from './NodeInfo'
import { HeaderCard } from '../clusters/ClusterDetailsPage'
import ClusterStatusSpan from '../clusters/ClusterStatus'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { variantIcon } from 'core/components/Alert'
import CodeBlock from 'core/components/CodeBlock'
import CopyToClipboard from 'core/components/CopyToClipboard'
import { hexToRGBA } from 'core/utils/colorHelpers'
import { getErrorMessage, hasClockDrift, meetsHardwareRequirement } from './helper'
import { clusterActions } from '../clusters/actions'
import { IClusterSelector } from '../clusters/model'
import {
  ClusterType,
  HardwareType,
  minAvailableDiskSpace,
  nodeHardwareRequirements,
} from '../clusters/bareos/constants'
import { getAvailableSpace } from '../clusters/bareos/ClusterHostChooser'

// Styles
const useStyles = makeStyles((theme: Theme) => ({
  pageContainer: {
    position: 'relative',
    maxWidth: 1234,
  },
  backLink: {
    position: 'absolute',
    right: 0,
    top: 8,
    zIndex: 100,
    ...theme.typography.caption2,
  },
  nodeInfoContainer: {
    marginTop: theme.spacing(2),
  },
  detailsHeader: {
    display: 'grid',
    gridTemplateColumns: '434px repeat(3, 250px)',
    gridGap: theme.spacing(2),
    paddingBottom: 20,
  },
  rowHelp: {
    width: 24,
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    color: theme.palette.grey[700],
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  rowValue: {
    marginLeft: theme.spacing(0.5),
    color: theme.palette.grey[700],
    wordBreak: 'break-all',
    display: 'flex',
    flexDirection: 'column',
  },
  clockDriftErrorMessage: {
    maxHeight: 165,
    fontSize: 14,
    padding: theme.spacing(0, 2),
    margin: 0,
    marginTop: theme.spacing(2),
    backgroundColor: 'transparent',
    color: theme.palette.red[500],
    fontWeight: 300,
    lineHeight: '15px',
  },
  clockDriftErrorAlert: {
    maxHeight: 224,
    maxWidth: 'inherit',
    padding: theme.spacing(0, 2, 2, 2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.red[500]}`,
    backgroundColor: hexToRGBA(theme.palette.red[500], 0.1),
    borderRadius: 4,

    '& > header': {
      color: theme.palette.red[500],
      borderBottom: `1px solid ${theme.palette.red[500]}`,
      display: 'grid',
      gridGap: theme.spacing(),
      gridTemplateColumns: '22px 1fr 22px',
      fontSize: 14,
      height: 40,
      alignItems: 'center',
    },
  },
}))

const NodeDetailsPage: FC = () => {
  const { match } = useReactRouter()
  const classes = useStyles({})
  const [nodes, loadingNodes] = useDataLoader(loadNodes)
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)

  const selectedNode: INodesSelector =
    nodes.find((x: INodesSelector) => x.uuid === match.params.id) || {}
  const cluster: IClusterSelector = selectedNode.clusterUuid
    ? clusters.find((cluster) => cluster.uuid === selectedNode.clusterUuid)
    : {}
  const loadingSomething = loadingNodes || loadingClusters
  const clockDriftErrorMsg = getErrorMessage(selectedNode, 'warn', ErrorMessageCodes.timeDrift)

  return (
    <PageContainer
      className={classes.pageContainer}
      header={
        <SimpleLink src={routes.nodes.list.path()} className={classes.backLink}>
          « Back to Node List
        </SimpleLink>
      }
    >
      <Progress loading={loadingSomething} message="Loading Nodes..." minHeight={200}>
        <div className={classes.nodeInfoContainer}>
          <NodeStatusAndUsage node={selectedNode} cluster={cluster} loading={loadingSomething} />
          {!!clockDriftErrorMsg && <NodeClockDriftError errorMessage={clockDriftErrorMsg} />}
          <NodeInfo />
        </div>
      </Progress>
    </PageContainer>
  )
}

const NodeClockDriftError = ({ errorMessage }) => {
  const classes = useStyles()
  return (
    <div className={classes.clockDriftErrorAlert}>
      <header>
        <FontAwesomeIcon>{variantIcon.error}</FontAwesomeIcon>
        <Text variant="caption1">Clock Drift Detected</Text>
        <CopyToClipboard copyText={errorMessage} copyIcon="copy" codeBlock={false} />
      </header>
      <CodeBlock className={classes.clockDriftErrorMessage}>{errorMessage}</CodeBlock>
    </div>
  )
}

export const DetailRow: FC<{
  label: string
  value: string | React.ReactNode
  helpMessage?: string
}> = ({ label, value, helpMessage }) => {
  const { rowHeader, rowValue, rowHelp } = useStyles({})
  return (
    <tr>
      <td>
        <Text className={rowHeader} variant="caption1" component="span">
          {label}:
        </Text>
      </td>
      <td>
        <Text
          className={rowValue}
          variant="body2"
          component={typeof value === 'string' ? 'span' : 'div'}
        >
          {value}
        </Text>
      </td>
      <td className={rowHelp}>
        {!!helpMessage && <HelpContainer title={helpMessage} color="black" />}
      </td>
    </tr>
  )
}

const NodeStatusAndUsage = ({ node, cluster, loading }) => {
  const classes = useStyles()
  const usage = useMemo(
    () => ({
      compute: calcUsageTotalByPath(
        [node],
        'combined.usage.compute.current',
        'combined.usage.compute.max',
      ),
      memory: calcUsageTotalByPath(
        [node],
        'combined.usage.memory.current',
        'combined.usage.memory.max',
      ),
      disk: calcUsageTotalByPath([node], 'combined.usage.disk.current', 'combined.usage.disk.max'),
    }),
    [node],
  )
  return (
    <div className={classes.detailsHeader}>
      <NodeStatus node={node} cluster={cluster} />
      <UsageWidget title="Compute" stats={usage.compute} units="GHz" />

      <UsageWidget title="Memory" stats={usage.memory} units="GiB" />

      <UsageWidget title="Storage" stats={usage.disk} units="GiB" />
    </div>
  )
}

const NodeStatus = ({ node, cluster }) => {
  const clusterType =
    cluster?.nodes?.length === 1 ? ClusterType.SingleNodeCluster : ClusterType.MultiNodeCluster
  const totalRamCapacity = node?.combined?.usage?.memory?.max
  const totalDiskSpace = node?.combined?.usage?.disk?.max
  const availableDiskSpace = getAvailableSpace(node?.combined?.usage?.disk)
  const nodeHasClockDrift = hasClockDrift(node)

  return (
    <HeaderCard title={node?.name} icon="cube" subtitle="" className="">
      <ClusterStatusSpan
        title={`Recommended Minimum RAM Capacity: ${
          nodeHardwareRequirements[clusterType][HardwareType.RAM]
        } GB`}
        status={
          meetsHardwareRequirement(totalRamCapacity, clusterType, HardwareType.RAM) ? 'ok' : 'fail'
        }
        variant="header"
        iconStatus
      >
        {`RAM Capacity: ${totalRamCapacity?.toFixed(2)} GB`}
      </ClusterStatusSpan>
      <ClusterStatusSpan
        title={`Recommended Minimum Available Disk Space: ${minAvailableDiskSpace} GB`}
        status={availableDiskSpace >= minAvailableDiskSpace ? 'ok' : 'fail'}
        variant="header"
        iconStatus
      >
        {`Available Disk Space: ${availableDiskSpace?.toFixed(2)} GB`}
      </ClusterStatusSpan>
      <ClusterStatusSpan
        title={`Recommended Minimum Total Disk Space: ${
          nodeHardwareRequirements[clusterType][HardwareType.Disk]
        } GB`}
        status={
          meetsHardwareRequirement(totalDiskSpace, clusterType, HardwareType.Disk) ? 'ok' : 'fail'
        }
        variant="header"
        iconStatus
      >
        {`Total Disk Space: ${totalDiskSpace?.toFixed(2)} GB`}
      </ClusterStatusSpan>
      <ClusterStatusSpan
        title={`Host clock ${nodeHasClockDrift ? 'is' : 'is not'} out of sync`}
        status={nodeHasClockDrift ? 'error' : 'ok'}
        variant="header"
        iconStatus
      >
        {nodeHasClockDrift ? 'Clock Drift Detected' : 'No Clock Drift Detected'}
      </ClusterStatusSpan>
    </HeaderCard>
  )
}

export default NodeDetailsPage

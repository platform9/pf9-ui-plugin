import { makeStyles, Theme } from '@material-ui/core'
import ExternalLink from 'core/components/ExternalLink'
import InfoPanel, { getFieldsForCard, IDetailFields } from 'core/components/InfoPanel'
import useDataLoader from 'core/hooks/useDataLoader'
import { routes } from 'core/utils/routes'
import React from 'react'
import useReactRouter from 'use-react-router'
import { castBoolToStr } from 'utils/misc'
import { loadNodes } from './actions'
import { orderInterfaces } from './helpers'
import { INodesSelector } from './model'
import { DetailRow } from './NodeDetailsPage'

const renderLink = (url, text) => <ExternalLink url={url}>{text}</ExternalLink>

const k8sNodeDetailsFields: Array<IDetailFields<INodesSelector>> = [
  {
    id: 'name',
    title: 'Name',
    required: true,
  },
  {
    id: 'uuid',
    title: 'Unique ID',
    required: true,
    helpMessage: 'This is the unique ID that PMK has assigned to this node.',
  },
  {
    id: 'primaryIp',
    title: 'Primary IP',
  },
  {
    id: 'isMaster',
    title: 'Is Master',
    render: castBoolToStr(),
  },
  {
    id: 'masterless',
    title: 'Masterless',
    render: castBoolToStr(),
  },
  {
    id: 'status',
    title: 'Status',
  },
  {
    id: 'api_responding',
    title: 'API Responding',
    render: castBoolToStr(),
  },
  {
    id: 'projectId',
    title: 'Project ID',
  },
  {
    id: 'startKube',
    title: 'Start Kube',
    render: castBoolToStr(),
  },
  {
    id: 'actualKubeRoleVersion',
    title: 'Actual Kube Role Version',
  },
  {
    id: 'cloudInstanceId',
    title: 'Cloud Instance ID',
  },
  {
    id: 'nodePoolUuid',
    title: 'Node Pool Unique ID',
  },
  {
    id: 'nodePoolName',
    title: 'Node Pool Name',
  },
  {
    id: 'clusterUuid',
    title: 'Cluster Unique ID',
  },
  {
    id: 'clusterName',
    title: 'Cluster Name',
    render: (value, node) =>
      renderLink(routes.cluster.detail.path({ id: node?.clusterUuid }), value),
  },
  {
    id: 'cloudProviderType',
    title: 'Cloud Provider Type',
  },
  {
    id: 'clusterKubeRoleVersion',
    title: 'Cluster Kube Role Version',
  },
  {
    id: 'isAuthorized',
    title: 'Is Authorized',
    render: castBoolToStr(),
  },
]

const miscFields = [
  {
    id: 'cpuArchitecture',
    title: 'CPU Architecture',
  },
  {
    id: 'operatingSystem',
    title: 'Operating System',
  },
  {
    id: 'roles',
    title: 'Roles',
  },
  {
    id: 'logs',
    title: 'Logs',
    render: (url) => renderLink(url, 'View Logs'),
  },
]

const useStyles = makeStyles<Theme>((theme) => ({
  nodeInfo: {
    display: 'grid',
    gridTemplateColumns: 'max-content max-content',
    gridGap: theme.spacing(2),
    alignItems: 'start',
    justifyItems: 'start',
  },
  miscNodeInfo: {
    display: 'grid',
    gridTemplateRows: 'max-content max-content',
    gridTemplateColumns: 'max-content',
    gridGap: theme.spacing(2),
  },
  networkInterfaces: {
    width: 'inherit !important',
  },
}))

const getNodeDetails = (node) => getFieldsForCard(k8sNodeDetailsFields, node)
const getMiscNodeDetails = (node) => getFieldsForCard(miscFields, node)

const renderNetworkInterfaceDetails = (interfaces, primaryNetwork) => {
  return (
    <table>
      <tbody>
        {interfaces.map(([interfaceName, interfaceIp]) => (
          <DetailRow
            key={interfaceIp}
            label={interfaceIp === primaryNetwork ? `${interfaceName} (primary)` : interfaceName}
            value={interfaceIp}
          />
        ))}
      </tbody>
    </table>
  )
}

const NodeInfo = () => {
  const { match } = useReactRouter()
  const classes = useStyles({})
  const [nodes] = useDataLoader(loadNodes)
  const node = nodes.find((x) => x.uuid === match.params.id) || {}

  const { primaryNetwork, networkInterfaces } = node
  const orderedInterfaces = orderInterfaces(networkInterfaces, primaryNetwork)

  const details = getNodeDetails(node)
  const miscDetails = getMiscNodeDetails(node)
  const networkInterfacesDetails = renderNetworkInterfaceDetails(orderedInterfaces, primaryNetwork)

  return (
    <div className={classes.nodeInfo}>
      <InfoPanel title="Kubernetes Node Details" items={details} />
      <div className={classes.miscNodeInfo}>
        <InfoPanel title="Misc" items={miscDetails} />
        <InfoPanel
          title="Network Interfaces"
          customBody={networkInterfacesDetails}
          className={classes.networkInterfaces}
        />
      </div>
    </div>
  )
}

export default NodeInfo

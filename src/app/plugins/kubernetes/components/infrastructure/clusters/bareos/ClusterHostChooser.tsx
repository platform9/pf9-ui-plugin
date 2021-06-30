import React, { forwardRef, useEffect } from 'react'
import useDataLoader from 'core/hooks/useDataLoader'
import withFormContext from 'core/components/validatedForm/withFormContext'
import {
  Checkbox,
  Radio,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Tooltip,
} from '@material-ui/core'
import Text from 'core/elements/text'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import { makeStyles } from '@material-ui/styles'
import { identity } from 'ramda'
import { INodesSelector, IUseDataLoader } from '../../nodes/model'
import PollingData from 'core/components/PollingData'
import { renderNetworkInterfaces } from 'k8s/components/infrastructure/nodes/NodesListPage'
import Theme from 'core/themes/model'
import NoContentMessage from 'core/components/NoContentMessage'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import clsx from 'clsx'
import { IconInfo } from 'core/components/validatedForm/Info'
import {
  ClusterType,
  minAvailableDiskSpace,
  HardwareType,
  nodeHardwareRequirements,
} from './constants'

interface Props extends IValidatedForm {
  value?: string[]
  hasError?: boolean
  errorMessage?: string
  pollForNodes?: boolean
  onChange?: (nodes: string[]) => void
  filterFn?: (node: INodesSelector) => boolean
  selection?: 'none' | 'single' | 'multiple'
  isSingleNodeCluster: boolean
  showResourceRequirements?: boolean
}

// TODO: all the ValidatedForm stuff is in JS and we need the props to be merged
// into this component.  Refactor this later on when we can convert
// ValidatedForm.js to TypeScript.
export interface IValidatedForm {
  id?: string
  validations?: any[] // What's the best way to type this?
  required?: boolean
  initialValues?: any
}

const useStyles = makeStyles<Theme>((theme) => ({
  table: {
    border: 'none',
    // borderColor: ({ hasError }) =>
    //   hasError ? theme.components.error.main : theme.palette.text.disabled,
    '& th.MuiTableCell-head': {
      borderBottomColor: theme.palette.grey[700],
    },
  },
  headerRow: {
    color: theme.palette.grey[500],
  },
  bodyCell: {
    padding: theme.spacing(2),
  },
  tableContainer: {
    margin: theme.spacing(2, 0),
  },
  errorText: {
    color: theme.components.error.main,
  },
  status: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    gridGap: theme.spacing(0.5),
  },
  availableResourceIcon: {
    alignSelf: 'center',
    width: theme.spacing(2),
    height: theme.spacing(2),
    color: theme.palette.grey['000'],
    fontSize: 12,
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 400,
    marginRight: theme.spacing(0.5),

    '&.success': {
      backgroundColor: theme.palette.green.main,
    },
    '&.fail': {
      backgroundColor: theme.palette.red.main,
    },
  },
  inlineText: {
    width: 'max-content',
    marginRight: theme.spacing(1),
  },
  fullWidthText: {
    width: 'max-content',
  },
}))

export const isConnected = (node: INodesSelector) => node.status === 'ok'
export const isUnassignedNode = (node: INodesSelector) => !node.clusterUuid
export const excludeNodes = (excludeList: string[] = []) => (node: INodesSelector) =>
  !excludeList.includes(node.uuid)
export const isMaster = (node: INodesSelector) => !!node.isMaster
export const isNotMaster = (node: INodesSelector) => !node.isMaster
export const inCluster = (clusterUuid: string) => (node: INodesSelector) =>
  node.clusterUuid === clusterUuid
export const hasClockDrift = (node) => node.message && node.message.warn && !!node.message.warn[0]

const emptyNode: INodesSelector = {} as any

export const getAvailableSpace = (disk) => {
  if (!disk) return 0
  return disk.max - disk.current
}

const ResourceStatus = ({ hasEnough, hooverText = '', children }) => {
  const classes = useStyles({})
  return (
    <div className={classes.status}>
      <Tooltip title={hooverText}>
        <FontAwesomeIcon
          className={clsx(classes.availableResourceIcon, {
            success: hasEnough,
            fail: !hasEnough,
          })}
        >
          {hasEnough ? 'check' : 'times'}
        </FontAwesomeIcon>
      </Tooltip>
      {children}
    </div>
  )
}

const renderCpuCount = (cpuCount, clusterType) => {
  if (!cpuCount) return null
  const recommendedCpuCount = nodeHardwareRequirements[clusterType][HardwareType.CPU]
  const hasEnough = cpuCount >= recommendedCpuCount
  const cpuCountHooverText = `Recommended number of CPUs is ${recommendedCpuCount}`
  return (
    <ResourceStatus hasEnough={hasEnough} hooverText={cpuCountHooverText}>
      <Text variant="body2">{cpuCount}</Text>
    </ResourceStatus>
  )
}

const renderRamCapacity = (ram, clusterType) => {
  if (!ram) return null
  const recommendedRamCapacity = nodeHardwareRequirements[clusterType][HardwareType.RAM]
  const enoughSpace = ram.max >= recommendedRamCapacity
  const ramCapacityHooverText = `Recommended RAM capacity is ${recommendedRamCapacity} GB`
  return (
    <ResourceStatus hasEnough={enoughSpace} hooverText={ramCapacityHooverText}>
      <Text variant="body2">{`${ram?.max.toFixed(2)} GB`}</Text>
    </ResourceStatus>
  )
}

const renderDiskSpaceStatus = (disk, clusterType) => {
  if (!disk) return null
  const recommendedTotalDiskSpace = nodeHardwareRequirements[clusterType][HardwareType.Disk]
  const availableSpace = getAvailableSpace(disk)
  const totalSpace = disk.max
  const enoughSpace =
    availableSpace >= minAvailableDiskSpace && totalSpace >= recommendedTotalDiskSpace
  const diskSpaceHooverText = `Recommended available disk space is ${minAvailableDiskSpace} GB and recommended total disk space is ${recommendedTotalDiskSpace} GB`
  return (
    <ResourceStatus hasEnough={enoughSpace} hooverText={diskSpaceHooverText}>
      <div>
        <Text variant="body2">Available: </Text>
        <Text variant="body2">{`${availableSpace.toFixed(2)} GB`}</Text>
        <Text variant="body2">Total: </Text>
        <Text variant="body2">{`${totalSpace.toFixed(2)} GB`}</Text>
      </div>
    </ResourceStatus>
  )
}

const renderClockDriftStatus = (message) => {
  const hasClockDrift = message && message.warn && message.warn[0]
  const clockDriftHooverText = 'Nodes with clock out of sync cannot be attached'
  return (
    <ResourceStatus
      hasEnough={!hasClockDrift}
      hooverText={hasClockDrift ? clockDriftHooverText : ''}
    >
      <Text variant="body2">{hasClockDrift ? 'Clock Drift Detected' : 'None'}</Text>
    </ResourceStatus>
  )
}

// TODO: is forwardRef actually needed here?
const ClusterHostChooser: React.ComponentType<Props> = forwardRef<HTMLElement, Props>(
  (props, ref: React.Ref<HTMLDivElement>) => {
    const {
      filterFn = identity,
      onChange,
      value = [],
      hasError,
      errorMessage,
      pollForNodes = false,
      selection = 'single',
      isSingleNodeCluster,
      showResourceRequirements = true,
    } = props
    const { table, tableContainer, errorText, headerRow, bodyCell } = useStyles()
    const [nodes, loading, loadMore]: IUseDataLoader<INodesSelector> = useDataLoader(
      loadNodes,
    ) as any

    const clusterType = isSingleNodeCluster
      ? ClusterType.SingleNodeCluster
      : ClusterType.MultiNodeCluster

    const Warning = ({ children }) => (
      <Text variant="body1" className={errorText}>
        {children}
      </Text>
    )

    const selectableNodes = nodes.filter(filterFn)

    useEffect(() => {
      if (value.length === 0) return
      // On first render, make sure that the selected nodes (value in props) are in the selectableNodes list
      // This is to fix the bug where if you choose worker nodes in the cluster creation form and
      // then go back to select one of the worker nodes as the master node, the node will be in both
      // the selected master and selected worker list
      onChange(value.filter((uuid) => selectableNodes.find((node) => node.uuid === uuid)))
    }, [])

    const allSelected = () => value.length === selectableNodes.length && value.length > 0
    const toggleAll = () => onChange(allSelected() ? [] : selectableNodes.map((x) => x.uuid))
    const isSelected = (uuid) => value.includes(uuid)

    const toggleHost = (uuid) => () => {
      const newHosts = isSelected(uuid)
        ? value.filter((x) => x !== uuid)
        : selection === 'multiple'
        ? [...value, uuid]
        : [uuid]
      onChange(newHosts)
    }

    const resourceRequirementsText = `All nodes must meet minimum resource requirement of ${
      nodeHardwareRequirements[clusterType][HardwareType.CPU]
    } CPUs, ${nodeHardwareRequirements[clusterType][HardwareType.RAM]} GB RAM, ${
      nodeHardwareRequirements[clusterType][HardwareType.Disk]
    } GB Disk`

    // TODO: The <Table> logic should be abstracted in a <TableChooser> that supports both multiple and single.
    return (
      <div ref={ref} className={tableContainer}>
        {showResourceRequirements && (
          <IconInfo icon="info-circle" title={resourceRequirementsText} spacer={false} />
        )}
        {pollForNodes && (
          <PollingData loading={loading} onReload={loadMore} pause={!pollForNodes} />
        )}
        {selectableNodes.length === 0 && (
          <NoContentMessage
            message="Waiting... Connect Nodes Using the VM Template/OVA or PF9 CLI"
            variant="light"
          />
        )}
        {selectableNodes.length > 0 && (
          <Table className={table}>
            <TableHead>
              <TableRow>
                <TableCell>
                  {selection === 'multiple' && (
                    <Checkbox color="primary" checked={allSelected()} onChange={toggleAll} />
                  )}
                </TableCell>
                <TableCell>
                  <Text variant="caption2" className={headerRow}>
                    Hostname
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="caption2" className={headerRow}>
                    IP Address
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="caption2" className={headerRow}>
                    Operating System
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="caption2" className={headerRow}>
                    CPU Count
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="caption2" className={headerRow}>
                    CPU Cores
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="caption2" className={headerRow}>
                    RAM Capacity
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="caption2" className={headerRow}>
                    Storage Capacity
                  </Text>
                </TableCell>
                <TableCell>
                  <Text variant="caption2" className={headerRow}>
                    Clock Drift
                  </Text>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectableNodes.map((node = emptyNode) => (
                <TableRow key={node.uuid} onClick={toggleHost(node.uuid)}>
                  <TableCell>
                    {selection === 'multiple' ? (
                      <Checkbox color="primary" checked={isSelected(node.uuid)} />
                    ) : selection === 'single' ? (
                      <Radio color="primary" checked={isSelected(node.uuid)} />
                    ) : null}
                  </TableCell>
                  <TableCell className={bodyCell}>
                    <Text variant="body2">{node.name}</Text>
                  </TableCell>
                  <TableCell className={bodyCell}>
                    <Text variant="body2">
                      {renderNetworkInterfaces(null, node, { wrapText: true })}
                    </Text>
                  </TableCell>
                  <TableCell className={bodyCell}>
                    <Text variant="body2">{node?.combined?.osInfo}</Text>
                  </TableCell>
                  <TableCell className={bodyCell}>
                    {renderCpuCount(
                      node?.combined?.resmgr?.info?.cpu_info?.cpu_sockets,
                      clusterType,
                    )}
                  </TableCell>
                  <TableCell className={bodyCell}>
                    <Text variant="body2">{node?.combined?.resmgr?.info?.cpu_info?.cpu_cores}</Text>
                  </TableCell>
                  <TableCell className={bodyCell}>
                    {renderRamCapacity(node?.combined?.usage?.memory, clusterType)}
                  </TableCell>
                  <TableCell className={bodyCell}>
                    {renderDiskSpaceStatus(node?.combined?.usage?.disk, clusterType)}
                  </TableCell>
                  <TableCell className={bodyCell}>
                    {renderClockDriftStatus(node?.combined?.resmgr?.message)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {hasError && <Warning>{errorMessage}</Warning>}
      </div>
    )
  },
)

export default withFormContext(ClusterHostChooser) as React.FC<Props>

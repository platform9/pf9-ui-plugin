import React, { forwardRef } from 'react'
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

interface Props extends IValidatedForm {
  value?: string[]
  hasError?: boolean
  errorMessage?: string
  pollForNodes?: boolean
  onChange?: (nodes: string[]) => void
  filterFn?: (node: INodesSelector) => boolean
  selection?: 'none' | 'single' | 'multiple'
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

const useStyles = makeStyles<Theme, Partial<Props>>((theme) => ({
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
  inlineText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  availableDiskIcon: {
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
}))

export const isConnected = (node: INodesSelector) => node.status === 'ok'
export const isUnassignedNode = (node: INodesSelector) => !node.clusterUuid
export const excludeNodes = (excludeList: string[] = []) => (node: INodesSelector) =>
  !excludeList.includes(node.uuid)
export const isMaster = (node: INodesSelector) => !!node.isMaster
export const isNotMaster = (node: INodesSelector) => !node.isMaster
export const inCluster = (clusterUuid: string) => (node: INodesSelector) =>
  node.clusterUuid === clusterUuid

const emptyNode: INodesSelector = {} as any
export const getAvailableSpace = (disk) => {
  if (!disk) return 0
  return disk.max - disk.current
}
const hasEnoughSpace = (disk) => {
  const availableSpace = getAvailableSpace(disk)
  return availableSpace >= 10 // 10gb free space
}

const AvailableDiskSpace = ({ disk }) => {
  const classes = useStyles({})
  const enoughSpace = hasEnoughSpace(disk)
  const availableSpace = getAvailableSpace(disk)

  return (
    <div className={classes.inlineText}>
      <FontAwesomeIcon
        className={clsx(classes.availableDiskIcon, {
          success: enoughSpace,
          fail: !enoughSpace,
        })}
      >
        {enoughSpace ? 'check' : 'times'}
      </FontAwesomeIcon>
      <Text variant="body2">
        {availableSpace.toFixed(2)} GB {enoughSpace ? 'available' : '- Insufficient'}
      </Text>
    </div>
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
    } = props
    const { table, tableContainer, errorText, headerRow, bodyCell } = useStyles(props)
    const [nodes, loading, loadMore]: IUseDataLoader<INodesSelector> = useDataLoader(
      loadNodes,
    ) as any

    const Warning = ({ children }) => (
      <Text variant="body1" className={errorText}>
        {children}
      </Text>
    )

    const selectableNodes = nodes.filter(filterFn)

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

    // TODO: The <Table> logic should be abstracted in a <TableChooser> that supports both multiple and single.
    return (
      <div ref={ref} className={tableContainer}>
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
                    Resource Utilization
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
                    <Text variant="body2">{node.combined?.osInfo}</Text>
                  </TableCell>
                  <TableCell className={bodyCell}>
                    <AvailableDiskSpace disk={node?.combined?.usage?.disk} />
                    {/* {renderStats(node.combined?.usage || {}, usageContainerClass)} */}
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

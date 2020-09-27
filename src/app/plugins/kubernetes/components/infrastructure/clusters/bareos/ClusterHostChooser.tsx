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
import {
  UsageBar,
  renderNetworkInterfaces,
} from 'k8s/components/infrastructure/nodes/NodesListPage'
import Theme from 'core/themes/model'

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
  id: string
  validations?: any[] // What's the best way to type this?
  required?: boolean
  initialValues?: any
}

const useStyles = makeStyles<Theme, Partial<Props>>((theme) => ({
  table: {
    border: '2px solid',
    borderColor: ({ hasError }) =>
      hasError ? theme.components.error.main : theme.palette.text.disabled,
  },
  tableContainer: {
    margin: theme.spacing(2, 0),
  },
  errorText: {
    color: theme.components.error.main,
  },
  usageContainerClass: {
    display: 'grid',
    minHeight: '70px',
    gridTemplateRows: 'repeat(3, 1fr)',
    alignItems: 'center',
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

const renderStats = (usage, className) => {
  return (
    <div className={className}>
      {usage.compute && <UsageBar stat={usage.compute} />}
      {usage.memory && <UsageBar stat={usage.memory} />}
      {usage.disk && <UsageBar stat={usage.disk} />}
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
    const { table, tableContainer, errorText, usageContainerClass } = useStyles(props)
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
        <Table className={table}>
          <TableHead>
            <TableRow>
              <TableCell>
                {selection === 'multiple' && (
                  <Checkbox checked={allSelected()} onChange={toggleAll} />
                )}
              </TableCell>
              <TableCell>Hostname</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Operating System</TableCell>
              <TableCell>Resource Utilization</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectableNodes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Text variant="body1">Waiting... Connect Nodes Using the PF9 CLI</Text>
                </TableCell>
              </TableRow>
            )}
            {selectableNodes.map((node = emptyNode) => (
              <TableRow key={node.uuid} onClick={toggleHost(node.uuid)}>
                <TableCell>
                  {selection === 'multiple' ? (
                    <Checkbox checked={isSelected(node.uuid)} />
                  ) : selection === 'single' ? (
                    <Radio checked={isSelected(node.uuid)} />
                  ) : null}
                </TableCell>
                <TableCell>{node.name}</TableCell>
                <TableCell>{renderNetworkInterfaces(null, node, { wrapText: true })}</TableCell>
                <TableCell>{node.combined?.osInfo}</TableCell>
                <TableCell>
                  {renderStats(node.combined?.usage || {}, usageContainerClass)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {hasError && <Warning>{errorMessage}</Warning>}
      </div>
    )
  },
)

export default withFormContext(ClusterHostChooser) as React.FC<Props>

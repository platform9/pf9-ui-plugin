import React, { forwardRef, useState } from 'react'
import withFormContext from 'core/components/validatedForm/withFormContext'
import {
  Checkbox,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Typography,
  Theme,
} from '@material-ui/core'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import Loading from 'core/components/Loading'
import { Refresh } from '@material-ui/icons'
import useInterval from 'core/hooks/useInterval'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles<any, any>((theme: Theme) => ({
  table: {
    border: '2px solid',
    borderColor: ({ hasError }) =>
      hasError ? theme.palette.error.main : theme.palette.text.disabled,
  },
  tableContainer: {
    margin: theme.spacing(2, 0),
  },
  errorText: {
    color: theme.palette.error.main,
  },
}))

interface Props {
  isMaster: boolean
  value: string[]
  excludeList: string[]
  hasError: boolean
  errorMessage: string
  pollForNodes: boolean
  onChange: (nodes: string[]) => void
}

// TODO: is forwardRef actually needed here?
const ClusterHostChooser: React.ComponentType<Props> = forwardRef(({
  isMaster = false,
  onChange,
  value = [],
  excludeList = [],
  hasError,
  errorMessage,
  pollForNodes = false,
},
ref,
) => {
  const { table, tableContainer, errorText } = useStyles({ hasError })
  const allSelected = () => value.length === orphanedNodes.length && value.length > 0
  const toggleAll = () => onChange(allSelected() ? [] : orphanedNodes.map((x) => x.uuid))
  const isSelected = (uuid) => value.includes(uuid)

  const [nodes, loading, loadMore] = useDataLoader(loadNodes)

  const [fetchingIn, setFetchingIn] = useState(5)

  if (pollForNodes) {
    useInterval(() => {
      if (!loading) {
        setFetchingIn(fetchingIn - 1)
      }
    }, 1000)

    if (fetchingIn < 0) {
      loadMore(true)
      setFetchingIn(5)
    }
  }
  const isLoading = loading || fetchingIn === 0

  const notAssignedToCluster = (node) => !node.clusterUuid

  // exclude list does not filter anything if isMaster
  const notInExcludeList = (node) => isMaster || !excludeList.includes(node.uuid)

  const orphanedNodes = nodes.filter(notAssignedToCluster).filter(notInExcludeList)

  const toggleHost = (uuid) => () => {
    const newHosts = isSelected(uuid) ? value.filter((x) => x !== uuid) : [...value, uuid]
    onChange(newHosts)
  }

  return (
    <div className={tableContainer}>
      {pollForNodes && (
        <Loading
          icon={Refresh}
          loading={isLoading}
          color={isLoading ? 'action' : 'primary'}
          justify="flex-end"
          onClick={() => loadMore(true)}
        >
          {isLoading ? 'loading...' : `reloading ${fetchingIn}s`}
        </Loading>
      )}
      <Table ref={ref} className={table}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Checkbox checked={allSelected()} onChange={toggleAll} />
            </TableCell>
            <TableCell>Hostname</TableCell>
            <TableCell>IP Address</TableCell>
            <TableCell>Operating System</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orphanedNodes.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography variant="body1">There are no nodes available.</Typography>
              </TableCell>
            </TableRow>
          )}
          {orphanedNodes.map((orphanedNode = {}) => (
            <TableRow key={orphanedNode.uuid}>
              <TableCell>
                <Checkbox
                  checked={isSelected(orphanedNode.uuid)}
                  onChange={toggleHost(orphanedNode.uuid)}
                />
              </TableCell>
              <TableCell>{orphanedNode.name}</TableCell>
              <TableCell>{orphanedNode.primaryIp}</TableCell>
              <TableCell>{orphanedNode.combined?.osInfo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {hasError && (
        <Typography variant="body1" className={errorText}>
          {errorMessage}
        </Typography>
      )}
    </div>
  )
},
)

export default withFormContext(ClusterHostChooser) as React.FC<Props>

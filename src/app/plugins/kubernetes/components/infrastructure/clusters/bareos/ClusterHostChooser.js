import React, { forwardRef, useState } from 'react'
import Progress from 'core/components/progress/Progress'
import withFormContext from 'core/components/validatedForm/withFormContext'
import { Checkbox, Table, TableHead, TableCell, TableRow, TableBody, Typography } from '@material-ui/core'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'
import Loading from 'core/components/Loading'
import { Refresh } from '@material-ui/icons'
import useInterval from 'core/hooks/useInterval'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  table: {
    border: '2px solid',
    borderColor: ({ hasError }) => hasError ? theme.palette.error.main : theme.palette.text.disabled
  },
  tableContainer: {
    margin: theme.spacing(2, 0),
  },
  errorText: {
    color: theme.palette.error.main
  }
}))

// TODO: is forwardRef actually needed here?
const ClusterHostChooser = forwardRef(
  ({ isMaster, onChange, value, excludeList, hasError, errorMessage, pollForNodes = false }, ref) => {
    // TODO: need to figure out a way to do validtion with our system to select 1, 3, or 5 nodes only for masters
    // const isValid = () => !isMaster || [1, 3, 5].includes(value.length)

    const { table, tableContainer, errorText } = useStyles({ hasError })
    const allSelected = () => value.length === orphanedNodes.length && value.length > 0
    const toggleAll = () => onChange(allSelected() ? [] : orphanedNodes.map(x => x.uuid))
    const isSelected = uuid => value.includes(uuid)

    const [nodes, loading, loadMore] = useDataLoader(loadNodes)

    const [fetchingIn, setFetchingIn] = useState(5)

    if (pollForNodes) {
      useInterval(() => {
        setFetchingIn(fetchingIn - 1)
      }, 1000)

      if (fetchingIn < 0) {
        loadMore(true)
        setFetchingIn(5)
      }
    }
    const isLoading = loading || fetchingIn === 0

    const notAssignedToCluster = node => !node.clusterUuid

    // exclude list does not filter anything if isMaster
    const notInExcludeList = node => isMaster || !excludeList.includes(node.uuid)

    const orphanedNodes = nodes.filter(notAssignedToCluster).filter(notInExcludeList)

    const toggleHost = uuid => () => {
      const newHosts = isSelected(uuid) ? value.filter(x => x !== uuid) : [...value, uuid]
      onChange(newHosts)
    }

    return (
      <React.Fragment>
        <Progress loading={loading} renderContentOnMount>
          <div className={tableContainer}>
            {pollForNodes && (
              <Loading
                icon={Refresh}
                loading={isLoading}
                color={isLoading ? 'action' : 'primary'}
                justify="flex-end"
                onClick={() => loadMore(true)}
              >
                {isLoading ? 'reloading...' : `reloading ${fetchingIn}s`}
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
                { orphanedNodes.length === 0 && (
                  <TableRow colSpan={4}>
                    <TableCell colSpan={4} align="center"><Typography variant="body1">There are no nodes available.</Typography></TableCell>
                  </TableRow>
                )}
                {orphanedNodes.map(orphanedNode => (
                  <TableRow key={orphanedNode.uuid}>
                    <TableCell>
                      <Checkbox checked={isSelected(orphanedNode.uuid)} onChange={toggleHost(orphanedNode.uuid)} />
                    </TableCell>
                    <TableCell>{orphanedNode.name}</TableCell>
                    <TableCell>{orphanedNode.primaryIp}</TableCell>
                    <TableCell>{orphanedNode.combined.osInfo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            { hasError && <Typography variant="body1" className={errorText}>{errorMessage}</Typography> }
          </div>
        </Progress>
      </React.Fragment>
    )
  },
)

ClusterHostChooser.propTypes = {
  isMaster: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.arrayOf(PropTypes.string),

  // This list will not show up in the choices.  Useful for excluding the already chosen master nodes.
  excludeList: PropTypes.arrayOf(PropTypes.string),
}

ClusterHostChooser.defaultProps = {
  isMaster: false,
  value: [],
  excludeList: [],
}

export default withFormContext(ClusterHostChooser)

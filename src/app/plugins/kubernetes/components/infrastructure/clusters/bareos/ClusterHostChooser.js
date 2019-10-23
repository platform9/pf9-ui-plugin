import React, { forwardRef, useState, useEffect } from 'react'
import withFormContext from 'core/components/validatedForm/withFormContext'
import { Checkbox, Table, TableHead, TableCell, TableRow, TableBody } from '@material-ui/core'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'

// TODO: is forwardRef actually needed here?
const ClusterHostChooser = forwardRef(({
  isMaster, onChange, value, excludeList,
}, ref) => {
  const [selected, setSelected] = useState(value)

  // TODO: need to figure out a way to do validtion with our system to select 1, 3, or 5 nodes only for masters
  // const isValid = () => !isMaster || [1, 3, 5].includes(selected.length)

  const allSelected = () => selected.length === hosts.length
  const toggleAll = () => setSelected(allSelected() ? [] : hosts.map(x => x.uuid))
  const isSelected = uuid => selected.includes(uuid)

  const [nodes] = useDataLoader(loadNodes)

  const notAssignedToCluster = node => !node.clusterUuid

  // exclude list does not filter anything if isMaster
  const notInExcludeList = node => isMaster || !excludeList.includes(node.uuid)

  const hosts = nodes.filter(notAssignedToCluster).filter(notInExcludeList)

  const toggleHost = uuid => () => {
    const newHosts = isSelected(uuid) ? selected.filter(x => x !== uuid) : [ ...selected, uuid ]
    setSelected(newHosts)
  }

  useEffect(() => {
    onChange && onChange(selected)
  }, [selected])

  return (
    <React.Fragment>
      <Table ref={ref}>
        <TableHead>
          <TableRow>
            <TableCell><Checkbox checked={allSelected()} onChange={toggleAll} /></TableCell>
            <TableCell>Hostname</TableCell>
            <TableCell>IP Address</TableCell>
            <TableCell>Operating System</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hosts.map(host => (
            <TableRow key={host.uuid}>
              <TableCell><Checkbox checked={isSelected(host.uuid)} onChange={toggleHost(host.uuid)} /></TableCell>
              <TableCell>{host.name}</TableCell>
              <TableCell>{host.primaryIp}</TableCell>
              <TableCell>{host.combined.osInfo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  )
})

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

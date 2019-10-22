import React, { forwardRef, useState, useEffect } from 'react'
import withFormContext from 'core/components/validatedForm/withFormContext'
import { Checkbox, Table, TableHead, TableCell, TableRow, TableBody } from '@material-ui/core'
import { loadCombinedHosts } from 'k8s/components/infrastructure/common/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'

// TODO: is forwardRef actually needed here?
const ClusterHostChooser = forwardRef(({
  isMaster, onChange, initialValue,
}, ref) => {
  // TODO: useDataLoader with to get a list of unauthorized hosts
  const [selected, setSelected] = useState(initialValue)

  const [combinedHosts] = useDataLoader(loadCombinedHosts)
  console.log(combinedHosts)

  // TODO: change mock data fields to match actual fields
  const hosts = [
    { id: '1', hostname: 'abc', ipAddress: '123.123.123.123', os: 'Ubuntu 16.04' },
    { id: '2', hostname: 'def', ipAddress: '123.123.123.124', os: 'Ubuntu 16.04' },
    { id: '3', hostname: 'ghi', ipAddress: '123.123.123.125', os: 'Ubuntu 16.04' },
  ]

  const isValid = () => !isMaster || [1, 3, 5].includes(selected.length)
  const allSelected = () => selected.length === hosts.length
  const toggleAll = () => setSelected(allSelected() ? [] : hosts.map(x => x.id))
  const isSelected = id => selected.includes(id)

  const toggleHost = id => () => setSelected(
    isSelected(id)
      ? selected.filter(x => x !== id)
      : [ ...selected, id ]
  )

  useEffect(() => {
    onChange && onChange(selected)
  }, [selected, onChange])

  return (
    <React.Fragment>
      <div>isValid: {isValid() ? 'yes' : 'no'}</div>
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
            <TableRow key={host.id}>
              <TableCell><Checkbox checked={isSelected(host.id)} onChange={toggleHost(host.id)} /></TableCell>
              <TableCell>{host.hostname}</TableCell>
              <TableCell>{host.ipAddress}</TableCell>
              <TableCell>{host.os}</TableCell>
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
  initialValue: PropTypes.arrayOf(PropTypes.string),
}

ClusterHostChooser.defaultProps = {
  isMaster: false,
  initialValue: [],
}

export default withFormContext(ClusterHostChooser)

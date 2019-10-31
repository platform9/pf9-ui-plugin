import React from 'react'
import PropTypes from 'prop-types'
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core'
import { isNilOrEmpty } from 'utils/fp'

const renderKeyValues = obj => Object.entries(obj)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ')

const PrometheusRulesTable = ({ rules, onDelete }) => {
  var groups = rules
  const allRules = groups.map(group =>
    group.rules.map(rule => ({
      ...rule,
      group: group.name,
      labels: isNilOrEmpty(rule.labels) ? {} : rule.labels,
    }))
  ).flat()

  return (
    <div>
      <Typography variant="h6">Rules</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Group</TableCell>
            <TableCell>Expression</TableCell>
            <TableCell>Labels</TableCell>
            <TableCell>Period</TableCell>
            <TableCell>&nbsp;</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allRules.map((rule, index) => (
            <TableRow key={index}>
              <TableCell>{rule.alert || rule.record || '-'}</TableCell>
              <TableCell>{rule.group}</TableCell>
              <TableCell>{rule.expr}</TableCell>
              <TableCell>{renderKeyValues(rule.labels)}</TableCell>
              <TableCell>{rule.for || '-'}</TableCell>
              <TableCell><Button size="small" color="primary" onClick={onDelete(rule.id)}>Delete</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

PrometheusRulesTable.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default PrometheusRulesTable

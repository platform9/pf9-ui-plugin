import React from 'react'
import PropTypes from 'prop-types'
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core'

const PrometheusRulesTable = ({ rules, onDelete }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Rule</TableCell>
          <TableCell>Severity</TableCell>
          <TableCell>Period</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>&nbsp;</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rules.map(rule => (
          <TableRow>
            <TableCell>{rule.name}</TableCell>
            <TableCell>{rule.rule}</TableCell>
            <TableCell>{rule.severity}</TableCell>
            <TableCell>{rule.period}</TableCell>
            <TableCell>{rule.description}</TableCell>
            <TableCell><Button size="small" color="primary" onClick={onDelete(rule.id)}>Delete</Button></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

PrometheusRulesTable.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default PrometheusRulesTable

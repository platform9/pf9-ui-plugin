import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { Card, CardHeader, CardContent, Divider } from '@material-ui/core'
import { DetailRow } from 'k8s/components/infrastructure/nodes/NodeDetailsPage'

const styles = (theme) => ({
  root: {},
  row: {
    width: '100%',
  },
  half: {
    display: 'inline-block',
    width: '50%',
  },
  card: {
    overflow: 'inherit',
  },
  detailRowDiv: {
    marginBottom: theme.spacing(2),
  },
})

const DetailRowDiv = withStyles(styles)(({ classes, items }) => (
  <div className={classes.detailRowDiv}>
    {Object.entries(items).map(([name, { value, helpMessage }]) => (
      <DetailRow label={name} value={value} helpMessage={helpMessage} />
    ))}
  </div>
))

const renderDetailRow = (items) => <DetailRowDiv items={items} />

const InfoPanel = withStyles(styles)(({ classes, items, title }) => (
  <Card className={classes.card}>
    <CardHeader title={title} titleTypographyProps={{ variant: 'h6' }} />
    <Divider />
    <CardContent>
      <table>
        <tbody>{Array.isArray(items) ? items.map(renderDetailRow) : renderDetailRow(items)}</tbody>
      </table>
    </CardContent>
  </Card>
))

InfoPanel.propTypes = {
  title: PropTypes.string,
  items: PropTypes.object,
}

export default InfoPanel

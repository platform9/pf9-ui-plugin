import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { Card, CardHeader, CardContent, Divider, Typography } from '@material-ui/core'
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
})

const InfoPanel = withStyles(styles)(({ classes, items, title }) => (
  <Card className={classes.card}>
    <CardHeader title={title} titleTypographyProps={{ variant: 'h6' }} />
    <Divider />
    <CardContent>
      <table>
        <tbody>
          {Object.entries(items).map(([name, { value, helpMessage }]) => (
            <DetailRow label={name} value={value} helpMessage={helpMessage} />
          ))}
        </tbody>
      </table>
    </CardContent>
  </Card>
))

InfoPanel.propTypes = {
  title: PropTypes.string,
  items: PropTypes.object,
}

export default InfoPanel

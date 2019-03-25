import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { Card, CardHeader, CardContent, Divider, Typography } from '@material-ui/core'

const styles = theme => ({
  root: {
  },
  row: {
    width: '100%',
  },
  half: {
    display: 'inline-block',
    width: '50%'
  },
})

const cast = x => {
  if (typeof x === 'boolean') { return x ? 'true' : 'false' }
  if (typeof x === 'string') { return x }
  return x || ''
}
const InfoPanel = withStyles(styles)(({ classes, items, title }) => (
  <Card>
    <CardHeader title={title} />
    <Divider />
    <CardContent>
      <div className={classes.root}>
        {Object.keys(items).map(key => (
          <div className={classes.row} key={key}>
            <div className={classes.half}><Typography variant="subtitle2">{key}</Typography></div>
            <div className={classes.half}>{cast(items[key])}</div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
))

InfoPanel.propTypes = {
  title: PropTypes.string,
  items: PropTypes.object,
}

export default InfoPanel

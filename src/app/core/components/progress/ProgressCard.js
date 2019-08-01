import React from 'react'
import { Card, CardContent, CircularProgress, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { addComma } from '../../utils/formatters'

const styles = theme => ({
  card: {
    minWidth: 200,
    maxHeight: 300,
    marginTop: theme.spacing(3)
  },
  title: {
    backgroundColor: theme.palette.grey[50]
  },
  icon: {
    float: 'right',
  },
  container: {
    position: 'relative',
    left: 'calc(50% - 75px)',
    height: 120,
    width: 120,
  },
  progress: {
    position: 'absolute'
  },
  percentage: {
    position: 'absolute',
    top: '50%',
    left: '45%'
  },
  description: {
    marginTop: theme.spacing(5),
  }
})

@withStyles(styles)
class ProgressCard extends React.Component {
  render () {
    const { classes, card: { title, used, total, unit } } = this.props
    const completed = Math.round(used/total * 100)
    return (
      <div className={classes.card}>
        <Card>
          <CardContent className={classes.title}>
            <Typography
              variant="h6"
              align="center"
              className={classes.title}
            >
              {title}
            </Typography>
          </CardContent>
          <CardContent>
            <div className={classes.container}>
              <CircularProgress
                className={classes.progress}
                variant="static"
                size={150}
                value={completed}
              />
              <Typography
                className={classes.percentage}
                variant="h5"
              >
                {completed}%
              </Typography>
            </div>
            <div className={classes.description}>
              <Typography
                variant="subtitle1"
                align="center"
                noWrap
              >
                {addComma(used, 0)} {unit} used of {addComma(total, 0)} {unit}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

export default ProgressCard

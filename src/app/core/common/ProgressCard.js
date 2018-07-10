import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Card, CardHeader, CardContent, CircularProgress, Typography } from '@material-ui/core'

const styles = theme => ({
  card: {
    maxWidth: 400,
  },
  container: {
    position: 'relative',
    height: 120,
    width: 120
  },
  progress: {
    position: 'absolute',
    // margin: theme.spacing.unit * 2,
  },
  percentage: {
    position: 'absolute',
    top: '50%',
    left: '45%'
  },
  description: {
    marginTop: 40
  }
})

@withStyles(styles)
class ProgressCard extends React.Component {
  state = {
    completed: 75,
  };

  render () {
    const { classes } = this.props
    return (
      <div>
        <Card className={classes.card}>
          <CardHeader>ABC</CardHeader>
          <CardContent>
            <div>
              <div className={classes.container}>
                <CircularProgress
                  className={classes.progress}
                  variant="static"
                  size={150}
                  value={this.state.completed}
                />
                <Typography
                  className={classes.percentage}
                  variant="headline"
                >
                  {this.state.completed}%
                </Typography>
              </div>
              <div>
                <Typography
                  className={classes.description}
                  variant="subheading"
                >
                  dfasdf used of dfasd
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      
    )
  }
}

export default ProgressCard

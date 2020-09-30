import React, { PureComponent } from 'react'
import { Card, CardContent, CircularProgress } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { addComma } from '../../utils/formatters'
import Text from 'core/elements/text'

const styles = (theme) => ({
  card: {
    minWidth: 200,
    maxHeight: 300,
    marginTop: theme.spacing(3),
  },
  title: {
    backgroundColor: theme.palette.grey[50],
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
    position: 'absolute',
  },
  percentage: {
    position: 'absolute',
    top: '50%',
    left: '45%',
  },
  description: {
    marginTop: theme.spacing(5),
  },
})

@withStyles(styles)
class ProgressCard extends PureComponent {
  render() {
    const {
      classes,
      card: { title, used, total, unit },
    } = this.props
    const completed = Math.round((used / total) * 100)
    return (
      <div className={classes.card}>
        <Card>
          <CardContent className={classes.title}>
            <Text variant="h6" align="center" className={classes.title}>
              {title}
            </Text>
          </CardContent>
          <CardContent>
            <div className={classes.container}>
              <CircularProgress
                className={classes.progress}
                variant="static"
                size={150}
                value={completed}
              />
              <Text className={classes.percentage} variant="h5">
                {completed}%
              </Text>
            </div>
            <div className={classes.description}>
              <Text variant="subtitle1" align="center" noWrap>
                {addComma(used, 0)} {unit} used of {addComma(total, 0)} {unit}
              </Text>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

export default ProgressCard

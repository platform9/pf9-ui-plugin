import { Button, Card, CardContent, CardMedia, Grid, Tooltip, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import GetAppIcon from '@material-ui/icons/GetApp'
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore'
import { path } from 'ramda'
import React from 'react'

const styles = theme => ({
  card: {
    display: 'flex'
    // margin: theme.spacing.unit,
    // padding: 0
  },
  text: {
    display: 'inline-block',
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit * 0.5
  },
  rightText: {
    display: 'inline-block'
  },
  header: {
    textAlign: 'center',
    width: 120,
    padding: theme.spacing.unit * 2,
    borderRight: '1px solid #d2d2d2'
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  icon: {
    width: '100%',
    minHeight: 120,
    backgroundSize: 'contain',
    backgroundPosition: `50% ${theme.spacing.unit}px`,
    marginBottom: theme.spacing.unit
  },
  buttonIcon: {
    marginRight: theme.spacing.unit
  },
  divider: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  },
  info: {
    overflow: 'hidden',
    position: 'relative',
    /* use this value to count block height */
    lineHeight: '1.5em',
    /* max-height = line-height (1.2) * lines max number (3) */
    maxHeight: '4.5em',
    textAligh: 'justify',
    marginRight: '-1em',
    paddingRight: '1em',
    '&:before': {
      content: '\'...\'',
      position: 'absolute',
      right: theme.spacing.unit,
      bottom: 0
    },
    '&:after': {
      content: '\'\'',
      position: 'absolute',
      right: 0,
      width: '2em',
      height: '1em',
      marginTop: '0.2em',
      background: 'white'
    }
  },
  content: {
    flex: '1 0 auto'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: theme.spacing.unit
  }
})

class ApplicationCard extends React.Component {
  handleAddToEnv = () => {
    this.props.handleAddToEnv()
  }

  handleDeploy = () => {
    this.props.handleDeploy()
  }

  handleEdit = () => {
    this.props.handleEdit()
  }

  handleDetail = () => {
    this.props.handleDetail()
  }

  handleDownload = () => {
    this.props.handleDownload()
  }

  handleDelete = () => {
    this.props.handleDelete()
  }

  render () {
    const {
      classes,
      application: {
        attributes: { name, description },
        relationships
      }
    } = this.props

    const icon = path(
      ['latestChartVersion', 'data', 'icons', 0, 'path'],
      relationships
    )

    return (
      <Grid item sm={6} md={4} lg={4}>
        <Card className={classes.card}>
          <div className={classes.header}>
            <CardMedia className={classes.icon} image={icon} title="icon" />
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleDeploy}
            >
              Deploy
            </Button>
          </div>
          <div className={classes.details}>
            <CardContent className={classes.content}>
              <Typography component="h6" variant="h6">
                {name}
              </Typography>
              <Typography variant="body1" className={classes.text}>
                {description}
              </Typography>
            </CardContent>
            <div className={classes.actions}>
              <Button onClick={this.handleDetail}>
                <Tooltip title="More details about this application">
                  <UnfoldMoreIcon />
                </Tooltip>
              </Button>
              <Button onClick={this.handleDownload}>
                <Tooltip title="Download the .tgz file for this application">
                  <GetAppIcon />
                </Tooltip>
              </Button>
            </div>
          </div>
        </Card>
      </Grid>
    )
  }
}

export default withStyles(styles)(ApplicationCard)

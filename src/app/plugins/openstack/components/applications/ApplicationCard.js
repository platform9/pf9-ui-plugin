import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Hidden,
  Tooltip,
  Typography
} from '@material-ui/core'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import PublishIcon from '@material-ui/icons/Publish'
import EditIcon from '@material-ui/icons/Edit'
import GetAppIcon from '@material-ui/icons/GetApp'
import DeleteIcon from '@material-ui/icons/Delete'
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore'
import { rootPath } from 'core/globals'

const styles = theme => ({
  card: {
    margin: theme.spacing.unit,
    padding: 0
  },
  text: {
    display: 'inline-block',
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit * 0.5
  },
  rightText: {
    display: 'inline-block'
  },
  ActionContainer: {
    marginTop: -theme.spacing.unit
  },
  CRUDContainer: {
    marginBottom: theme.spacing.unit
  },
  icon: {
    float: 'left',
    width: 80,
    height: 80,
    marginRight: theme.spacing.unit * 1.5,
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
      content: "'...'",
      position: 'absolute',
      right: theme.spacing.unit,
      bottom: 0
    },
    '&:after': {
      content: "''",
      position: 'absolute',
      right: 0,
      width: '2em',
      height: '1em',
      marginTop: '0.2em',
      background: 'white'
    }
  }
})

class ApplicationCard extends React.Component {
  handleAddToEnv = () => {
    // TODO
  }

  handleDeploy = () => {
    // TODO
  }

  handleEdit = () => {
    // TODO
  }

  handleDetail = () => {
    // TODO
  }

  handleDownload = () => {
    // TODO
  }

  handleDelete = () => {
    // TODO
  }

  render () {
    const { classes, application } = this.props
    return (
      <Grid item sm={6} md={4} lg={4}>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="headline" paragraph>{application.name}</Typography>
            <CardMedia
              className={classes.icon}
              image={rootPath+'images/image_catalog/icon-ubuntu.png'}
              title="icon"
            />
            <div className={classes.info}>
              {application.description}
            </div>
            <Typography variant="body2" className={classes.text}>Tenant:</Typography>
            <Typography variant="body1" className={classes.rightText}>{application.tenant}</Typography>
          </CardContent>
          <div className={classes.ActionContainer} align="center">
            <Button onClick={this.handleAddToEnv}>
              <Tooltip title="Add to Environment">
                <AddCircleIcon className={classes.buttonIcon} />
              </Tooltip>
              <Hidden mdDown>
                <div>Add to Environment</div>
              </Hidden>
            </Button>
            <Button onClick={this.handleDeploy}>
              <Tooltip title="1-click Deploy">
                <PublishIcon className={classes.buttonIcon} />
              </Tooltip>
              <Hidden mdDown>
                <div>1-click Deploy</div>
              </Hidden>
            </Button>
          </div>
          <Divider className={classes.divider} />
          <div className={classes.CRUDContainer} align="center">
            <Button onClick={this.handleEdit}>
              <EditIcon />
            </Button>
            <Button onClick={this.handleDetail}>
              <UnfoldMoreIcon />
            </Button>
            <Button onClick={this.handleDownload}>
              <GetAppIcon />
            </Button>
            <Button onClick={this.handleDelete}>
              <DeleteIcon />
            </Button>
          </div>
        </Card>
      </Grid>
    )
  }
}

export default withStyles(styles)(ApplicationCard)

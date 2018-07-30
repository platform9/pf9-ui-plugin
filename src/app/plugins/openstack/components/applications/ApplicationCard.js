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
    marginTop: theme.spacing.unit,
    padding: 0
  },
  info: {
    display: '-webkit-box',
    minHeight: theme.spacing.unit * 12,
    '-webkit-line-clamp': 4,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  text: {
    display: 'inline-block',
    marginTop: theme.spacing.unit,
    marginLeft: theme.spacing.unit * 11.5,
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
  }
})

class ApplicationCard extends React.Component {
  render () {
    const { classes, application } = this.props
    return (
      <Grid item md={6} lg={4}>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="headline" paragraph>{application.name}</Typography>
            <CardMedia
              className={classes.icon}
              image={rootPath+'images/image_catalog/icon-ubuntu.png'}
              title="icon"
            />
            <Typography className={classes.info} variant="subheading" color="textSecondary">{application.description}</Typography>
            <Typography variant="body2" className={classes.text}>Tenant:</Typography>
            <Typography variant="body1" className={classes.rightText}>{application.tenant}</Typography>
          </CardContent>
          <div className={classes.ActionContainer} align="center">
            <Button>
              <Tooltip title="Add to Environment">
                <AddCircleIcon className={classes.buttonIcon} />
              </Tooltip>
              <Hidden mdDown>
                <div>Add to Environment</div>
              </Hidden>
            </Button>
            <Button>
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
            <Button>
              <EditIcon />
            </Button>
            <Button>
              <UnfoldMoreIcon />
            </Button>
            <Button>
              <GetAppIcon />
            </Button>
            <Button>
              <DeleteIcon />
            </Button>
          </div>
        </Card>
      </Grid>
    )
  }
}

export default withStyles(styles)(ApplicationCard)

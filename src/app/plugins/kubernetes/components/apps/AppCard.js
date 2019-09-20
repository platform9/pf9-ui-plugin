import { Button, Card, CardContent, CardMedia, Grid, Tooltip, Typography } from '@material-ui/core'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import GetAppIcon from '@material-ui/icons/GetApp'
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore'
import { compose } from 'ramda'
import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import SimpleLink from 'core/components/SimpleLink'

const styles = theme => ({
  card: {
    display: 'flex',
    // margin: theme.spacing(1),
    // padding: 0
  },
  text: {
    display: 'inline-block',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(0.5),
    maxWidth: 100,
    textOverflow: 'clip',
    whiteSpace: 'pre-wrap',
    overflow: 'hidden',
    flexWrap: 'wrap',
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
  },
  rightText: {
    display: 'inline-block',
  },
  header: {
    flexBasis: 90,
    minWidth: 90,
    padding: theme.spacing(2),
    borderRight: '1px solid #d2d2d2',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    flexBasis: 'auto',
    flexShrink: 1,
    flexGrow: 1,
    overflow: 'hidden',
  },
  icon: {
    width: '100%',
    minHeight: 120,
    backgroundSize: 'contain',
    backgroundPosition: `50% ${theme.spacing(1)}px`,
    marginBottom: theme.spacing(1),
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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
      right: theme.spacing(1),
      bottom: 0,
    },
    '&:after': {
      content: '\'\'',
      position: 'absolute',
      right: 0,
      width: '2em',
      height: '1em',
      marginTop: '0.2em',
      background: 'white',
    },
  },
  content: {
    flex: '1 0 auto',
    height: 140,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: theme.spacing(1),
  },
})

class AppCard extends PureComponent {
  handleDeploy = () => {
    if (this.props.handleDeploy) {
      this.props.handleDeploy()
    }
  }

  handleDownload = () => {
    if (this.props.handleDownload) {
      this.props.handleDownload()
    }
  }

  render () {
    const {
      classes,
      clusterId,
      application: {
        id,
        logoUrl,
        attributes: { name, description },
      },
    } = this.props
    const detailUrl = `/ui/kubernetes/apps/${clusterId}/${id}`
    return (
      <Grid item sm={6} md={4} lg={4}>
        <Card className={classes.card}>
          <div className={classes.header}>
            <CardMedia className={classes.icon} image={logoUrl} title={name} />
            <Button
              variant="outlined"
              color="primary"
              onClick={this.handleDeploy}
            >
              Deploy
            </Button>
          </div>
          <div className={classes.details}>
            <CardContent className={classes.content}>
              <SimpleLink src={detailUrl}>
                <Typography variant="subtitle1">
                  {name}
                </Typography>
              </SimpleLink>
              <Typography variant="body2" className={classes.text}>
                {description}
              </Typography>
            </CardContent>
            <div className={classes.actions}>
              <Button href={detailUrl}>
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

AppCard.propTypes = {
  handleDeploy: PropTypes.func,
  handleDownload: PropTypes.func,
  application: PropTypes.object,
}

export default compose(
  withRouter,
  withStyles(styles),
)(AppCard)

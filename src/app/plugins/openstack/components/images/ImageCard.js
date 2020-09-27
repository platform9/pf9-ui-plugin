import React from 'react'
import { withStyles } from '@material-ui/styles'
import { Button, Card, CardContent, CardMedia, Grid } from '@material-ui/core'
import Text from 'core/elements/text'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import { rootPath } from 'core/globals'

const styles = (theme) => ({
  card: {
    display: 'flex',
    marginTop: theme.spacing(2.5),
    padding: theme.spacing(3),
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
    paddingTop: 0,
  },
  cover: {
    width: 120,
    height: 120,
  },
  root: {
    flexGrow: 1,
  },
  icon: {
    marginRight: theme.spacing(0.5),
  },
  text: {
    display: 'inline-block',
    marginRight: theme.spacing(0.5),
  },
})

class ImageCard extends React.PureComponent {
  render() {
    const { classes, image } = this.props
    return (
      <Card className={classes.card}>
        <div align="center">
          <CardMedia className={classes.cover} image={rootPath + image.icon} title="logo" />
          <Text variant="subtitle1" color="textSecondary">
            {image.os}
          </Text>
          <Button href={image.location}>
            <CloudDownloadIcon color="primary" className={classes.icon} />
            <Text>Download</Text>
          </Button>
        </div>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Text variant="h5" paragraph>
              {image.name}
            </Text>
            <Text variant="subtitle1" color="textSecondary" paragraph>
              {image.description}
            </Text>
            <br />
            <Grid container className={classes.root} spacing={2}>
              <Grid item sm={3}>
                <Text variant="body1" className={classes.text}>
                  Disk Format:{' '}
                </Text>
                <Text variant="body2" className={classes.text} paragraph>
                  {image.disk_format}
                </Text>
                <br />
                <Text variant="body1" className={classes.text}>
                  Image Size:{' '}
                </Text>
                <Text variant="body2" className={classes.text}>
                  {image.size}
                </Text>
              </Grid>
              <Grid item sm={6}>
                <Text variant="body1" className={classes.text}>
                  MD5sum:{' '}
                </Text>
                <Text variant="body2" className={classes.text} paragraph>
                  {image.md5sum}
                </Text>
                <br />
                <Text variant="body1" className={classes.text}>
                  Default User:{' '}
                </Text>
                <Text variant="body2" className={classes.text}>
                  {image.default_user}{' '}
                </Text>
              </Grid>
              <Grid item sm={3}>
                <Text variant="body1" className={classes.text}>
                  Default Password:{' '}
                </Text>
                <Text variant="body2" className={classes.text}>
                  {image.default_password}
                </Text>
              </Grid>
            </Grid>
          </CardContent>
        </div>
      </Card>
    )
  }
}

export default withStyles(styles)(ImageCard)

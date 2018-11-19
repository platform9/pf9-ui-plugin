import React from 'react'
import ImageCard from './ImageCard'
import imageCatalog from './image_catalog.json'
import { withStyles } from '@material-ui/core/styles'
import { Paper, Typography } from '@material-ui/core'

const styles = theme => ({
  instruction: {
    marginTop: theme.spacing.unit * 2.5,
    padding: theme.spacing.unit * 4
  }
})

class ImageCardListPage extends React.Component {
  onClick = () => {
    this.props.onChange(null, '/ui/openstack/images#images')
  }

  render () {
    const { classes } = this.props
    return (
      <div>
        <Paper className={classes.instruction}>
          <Typography variant="body1" component="p" style={{'lineHeight': 2}}>
            These are pre-built Virtual Machine Images for commonly used Operating Systems. We have built these images with cloud-init pre-installed for ease of use. All you need to do is download the Image locally, then copy it over to the appropriate folder on the Host that’s assigned the ‘Image Library’ role, and they will be part of your Image catalog, ready for consumption! Click the New Image button under the <a style={{'textDecoration': 'underline', 'color': '#4aa3df', 'cursor': 'pointer'}} onClick={this.onClick}>Imported Images Tab</a> for more details.
          </Typography>
        </Paper>
        {imageCatalog.map(image =>
          <ImageCard image={image} key={image.md5sum} />)}
      </div>
    )
  }
}

export default withStyles(styles)(ImageCardListPage)

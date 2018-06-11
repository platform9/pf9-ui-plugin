import React, { Fragment } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'
import { withStyles } from '@material-ui/core/styles'
import { Button, Divider, Paper, Typography as Tp } from '@material-ui/core'
import ListTable from 'core/common/ListTable'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 8
  },
  Tp: {
    padding: theme.spacing.unit * 8
  },
  code: {
    fontSize: '90%',
    padding: theme.spacing.unit * 0.25,
    color: theme.palette.primary.main,
    background: theme.palette.grey[100],
    borderRadius: '3px'
  },
  textspan: {
    display: 'inline-block',
    width: '17ch'
  }
})

// Fake data. Should fetching data from host
let id = 0
function createData (name, ip, path) {
  id += 1
  return { id, name, ip, path }
}

const columns = [
  { id: 'name', label: 'Host Name' },
  { id: 'ip', label: 'IP Address' },
  { id: 'path', label: 'Path to Image Library Watch Folder' }
]

const data = [
  createData('test.company.sys', '10.10.10.10', '/var/opt/company/imagelibrary/data'),
  createData('dev.company.sys', '11.11.11.11', '/var/opt/company/imagelibrary/data')
]

class AddGlanceImagePage extends React.Component {
  renderManualImport () {
    const { classes } = this.props
    return (
      <Fragment>
        <Tp> We support two ways to import images into your Glance Image Catalog: </Tp>
        <Tp variant="title"> Manual Import </Tp>
        <Tp>
          The easiest way to populate your Image Catalog is by copying images into the image library watch folder on the host assigned with the Image Library role.
        </Tp>
        <Tp>  The following host is currently assigned the Image Library role: </Tp>
        <ListTable title="Host List" columns={columns} data={data} />
        <Tp>
          Please <span className={classes.code}>scp</span> the image(s) to this watch folder, and they will be automatically imported into your Glance Image Catalog.
        </Tp>
        <Tp>
          <b>Important</b>: Remove colons <span className={classes.code}>:</span> from image file names. Images with names containing colons may be falsely reported.
        </Tp>
        <Tp>
          If an image is <span className={classes.code}>raw</span>, and not in a format that is recognized by the <span className={classes.code}>qemu-img info</span> command, it must have one of the following extensions: .raw, .img, .dat, .bin.
        </Tp>
        <Tp>
          <b>Image Permissions</b>: Your image files must have the right permissions - world-readable or readable to <span className={classes.code}>company</span> user and <span className={classes.code}>company-group</span> group.
        </Tp>
        <Tp>
          You can use the following command on the image file: <span className={classes.code}>chown pf9:pf9group &lt;image-file-name&gt;</span>
        </Tp>
      </Fragment>
    )
  }

  renderGlancedClinet () {
    const { classes } = this.props
    return (
      <Fragment>
        <Tp variant="title">Using OpenStack Glance Client</Tp>
        <Tp>Use the OpenStack Glance Client to import images into Platform9.</Tp>
        <Tp>Example:</Tp>
        <Tp className={classes.code}>
          glance image-create&nbsp;&nbsp;--disk-format qcow2 \<br />
          <span className={classes.textspan}>&nbsp;</span>--container-format bare \<br />
          <span className={classes.textspan}>&nbsp;</span>--file ~/images/my-qcow2-img.img \<br />
          <span className={classes.textspan}>&nbsp;</span>--visibility public \<br />
          <span className={classes.textspan}>&nbsp;</span>--name myimage \<br />
          <span className={classes.textspan}>&nbsp;</span>--property pf9_description='best image ever' \<br />
          <span className={classes.textspan}>&nbsp;</span>--property virtual_size=41126400
        </Tp>
        <Tp>
          See the following support article for details: <a href="https://platform9.com/support/managing-images-with-the-openstack-glance-client/"> Managing Images with the OpenStack Glance Client</a>.
        </Tp>
      </Fragment>
    )
  }

  renderCreateNewImage () {
    return (
      <Fragment>
        <Tp variant="title">Creating a new image</Tp>
        <Tp>If you wish to create an image from scratch you may follow this guide:</Tp>
        <Tp>
          <a href="https://docs.openstack.org/image-guide/create-images-manually.html">Create any Virtual Machine Image from Scratch</a>
        </Tp>
      </Fragment>
    )
  }

  render () {
    const { classes } = this.props
    return (
      <Fragment>
        <Paper className={classes.root}>
          <Button variant="outlined" component={Link} to="/ui/openstack/glanceimages">&lt;&lt;&nbsp;Back to list</Button>
          <Tp variant="display3" color="primary">Import a New Image</Tp>
          <Divider />
          {this.renderManualImport()}
          {this.renderGlancedClinet()}
          <Divider />
          {this.renderCreateNewImage()}
        </Paper>
      </Fragment>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo,
  withStyles(styles)
)(AddGlanceImagePage)

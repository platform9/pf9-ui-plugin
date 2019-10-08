import React from 'react'
import SimpleLink from 'core/components/SimpleLink'
import { k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: '800px',
  }
}))

const iconSizes = {
  small: '',
  medium: '@2x',
  large: '@3x',
}
const iconSize = iconSizes.small

const icons = {
  aws: `/ui/images/icon-cloudproviders/icon-cloudproviders-aws${iconSize}.png`,
  azure: `/ui/images/icon-cloudproviders/icon-cloudproviders-azure${iconSize}.png`,
  openstack: `/ui/images/icon-cloudproviders/icon-cloudproviders-openstack${iconSize}.png`,
  other: `/ui/images/icon-cloudproviders/icon-cloudproviders-other${iconSize}.png`,
  vmware: `/ui/images/icon-cloudproviders/icon-cloudproviders-vmware${iconSize}.png`,
}

// TOOD: implement new UX for choosing the cluster type to create first.
// This is a placeholder for now.
const AddClusterPage = () => {
  const classes = useStyles()
  return (
    <div>
      <h1>Choose a cluster type to create</h1>

      <div className={classes.root}>
        <SimpleLink src={`${k8sPrefix}/infrastructure/clusters/addAws`}><img src={icons.aws} /></SimpleLink>
        <SimpleLink src={`${k8sPrefix}/infrastructure/clusters/addBareOs`}><img src={icons.openstack} /></SimpleLink>
        <SimpleLink src={`${k8sPrefix}/infrastructure/clusters/addAzure`}><img src={icons.azure} /></SimpleLink>
      </div>
    </div>

  )
}

export default AddClusterPage

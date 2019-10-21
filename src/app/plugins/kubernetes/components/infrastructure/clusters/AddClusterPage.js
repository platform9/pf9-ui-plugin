import React from 'react'
import SimpleLink from 'core/components/SimpleLink'
import Typography from '@material-ui/core/Typography'
import { k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: '800px',
  },
  provider: {
    width: '130px',
    height: '80px',
    borderRadius: '4px',
    border: 'solid 1px #888',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    textAlign: 'center',
  }
}))

const iconSizes = { small: '', medium: '@2x', large: '@3x' }
const iconSize = iconSizes.small
const rootPath = '/ui/images/icon-cloudproviders'

const icons = {
  aws: `${rootPath}/icon-cloudproviders-aws${iconSize}.png`,
  azure: `${rootPath}/icon-cloudproviders-azure${iconSize}.png`,
  openstack: `${rootPath}/icon-cloudproviders-openstack${iconSize}.png`,
  other: `${rootPath}/icon-cloudproviders-other${iconSize}.png`,
  vmware: `${rootPath}/icon-cloudproviders-vmware${iconSize}.png`,
}

const AddClusterPage = () => {
  const classes = useStyles()

  const CloudProviderLink = ({ label, image, src }) => (
    <div className={classes.centered}>
      <SimpleLink src={src}>
        <div className={classes.provider}><img src={image} /></div>
        <Typography variant="subtitle1">{label}</Typography>
      </SimpleLink>
    </div>
  )

  return (
    <div>
      <Typography variant="h5">Select one of the support Cloud Provider Types:</Typography>

      <div className={classes.root}>
        <CloudProviderLink label="Bare OS" image={icons.other} src={`${k8sPrefix}/infrastructure/clusters/addBareOs`} />
        <CloudProviderLink label="AWS" image={icons.aws} src={`${k8sPrefix}/infrastructure/clusters/addAws`} />
        <CloudProviderLink label="Azure" image={icons.azure} src={`${k8sPrefix}/infrastructure/clusters/addAzure`} />
      </div>
    </div>

  )
}

export default AddClusterPage

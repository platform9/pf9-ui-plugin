import React, { useState, useMemo } from 'react'
import createAddComponents from 'core/helpers/createAddComponents'
import { cloudProviderActions } from 'k8s/components/infrastructure/cloudProviders/actions'
import { makeStyles } from '@material-ui/styles'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import { objSwitchCase } from 'utils/fp'
import AddAwsCloudProvider from 'k8s/components/infrastructure/cloudProviders/AddAwsCloudProvider'
import AddOpenstackCloudProvider from 'k8s/components/infrastructure/cloudProviders/AddOpenstackCloudProvider'
import AddVmwareCloudProvider from 'k8s/components/infrastructure/cloudProviders/AddVmwareCloudProvider'
import { Typography } from '@material-ui/core'
import AddAzureCloudProvider from 'k8s/components/infrastructure/cloudProviders/AddAzureCloudProvider'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  cloudProviderCards: {
    maxWidth: 800,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    display: 'flex',
    flexFlow: 'row nowrap',
  },
}))

const AddCloudProviderForm = ({ loading, onComplete, ...rest }) => {
  const classes = useStyles()
  const [activeProvider, setActiveProvider] = useState('aws')
  const ActiveForm = useMemo(() => objSwitchCase({
    aws: AddAwsCloudProvider,
    openstack: AddOpenstackCloudProvider,
    vmware: AddVmwareCloudProvider,
    azure: AddAzureCloudProvider,
  })(activeProvider), [activeProvider])

  const handleOnComplete = params => {
    const data = { ...params, type: activeProvider }
    onComplete(data)
  }

  return <div className={classes.root}>
    <Typography variant="subtitle1">Cloud Provider Type</Typography>
    <Typography variant="body1">Select one of the supported Cloud Provider Types:</Typography>
    <div className={classes.cloudProviderCards}>
      <CloudProviderCard active={activeProvider === 'aws'} onClick={setActiveProvider} type="aws" />
      <CloudProviderCard active={activeProvider === 'azure'} onClick={setActiveProvider} type="azure" />
    </div>
    <ActiveForm loading={loading} onComplete={handleOnComplete} {...rest} />
  </div>
}

export const options = {
  createFn: cloudProviderActions.create,
  FormComponent: AddCloudProviderForm,
  listUrl: '/ui/kubernetes/infrastructure#cloudProviders',
  name: 'AddCloudProvider',
  title: 'New Cloud Provider',
}

const { AddPage } = createAddComponents(options)

export default AddPage

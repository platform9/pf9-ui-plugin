import React from 'react'
import Typography from '@material-ui/core/Typography'
import { k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: '800px',
  },
}))

const AddClusterPage = () => {
  const classes = useStyles()
  return (
    <div>
      <Typography variant="h5">Select one of the support Cloud Provider Types:</Typography>
      <div className={classes.root}>
        <CloudProviderCard type="other" src={`${k8sPrefix}/infrastructure/clusters/addBareOs`} />
        <CloudProviderCard type="aws" src={`${k8sPrefix}/infrastructure/clusters/addAws`} />
        <CloudProviderCard type="azure" src={`${k8sPrefix}/infrastructure/clusters/addAzure`} />
      </div>
    </div>
  )
}

export default AddClusterPage

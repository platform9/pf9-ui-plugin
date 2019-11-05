import React from 'react'
import { k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import FormWrapper from 'core/components/FormWrapper'
import { pathJoin } from 'utils/misc'

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: '800px',
  },
}))

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const AddClusterPage = () => {
  const classes = useStyles()
  return (
    <FormWrapper title="Select one of the supported Cloud Provider Types:" backUrl={listUrl}>
      <div className={classes.root}>
        <CloudProviderCard type="other" src={`${k8sPrefix}/infrastructure/clusters/addBareOs`} />
        <CloudProviderCard type="aws" src={`${k8sPrefix}/infrastructure/clusters/addAws`} />
        <CloudProviderCard type="azure" src={`${k8sPrefix}/infrastructure/clusters/addAzure`} />
      </div>
    </FormWrapper>
  )
}

export default AddClusterPage

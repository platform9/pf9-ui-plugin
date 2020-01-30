import React, { useMemo, useState } from 'react'
import { k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import FormWrapper from 'core/components/FormWrapper'
import { pathJoin } from 'utils/misc'

import useReactRouter from 'use-react-router'
import { CloudProviders } from './model'
import { objSwitchCase } from 'utils/fp'
import BareosClusterRequirements from './bareos/BareosClusterRequirements'
import AwsClusterRequirements from './aws/AwsClusterRequirements'
import AzureClusterRequirements from './azure/AzureClusterRequirements'

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '800px',
  },
  root: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
  },
}))

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const AddClusterPage = () => {
  const classes = useStyles()
  const { history, location } = useReactRouter()
  const providerType = new URLSearchParams(location.search).get('type') || CloudProviders.BareOS
  const [activeProvider, setActiveProvider] = useState(providerType)

  const handleNextView = (url) => {
    history.push(url)
  }

  const ActiveView = useMemo(
    () =>
      objSwitchCase({
        [CloudProviders.BareOS]: BareosClusterRequirements,
        [CloudProviders.Aws]: AwsClusterRequirements,
        [CloudProviders.Azure]: AzureClusterRequirements,
      })(activeProvider),
    [activeProvider],
  )
  return (
    <FormWrapper
      className={classes.container}
      title="Select where to deploy your Kubernetes Cluster"
      backUrl={listUrl}
    >
      <div className={classes.root}>
        <CloudProviderCard
          active={activeProvider === CloudProviders.BareOS}
          onClick={setActiveProvider}
          type={CloudProviders.BareOS}
        />
        <CloudProviderCard
          active={activeProvider === CloudProviders.Aws}
          onClick={setActiveProvider}
          type={CloudProviders.Aws}
        />
        <CloudProviderCard
          disabled
          active={activeProvider === CloudProviders.Azure}
          onClick={setActiveProvider}
          type={CloudProviders.Azure}
        />
      </div>
      <ActiveView onComplete={handleNextView} />
    </FormWrapper>
  )
}

export default AddClusterPage

import React, { useMemo, useState } from 'react'
import { k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import FormWrapper from 'core/components/FormWrapper'
import { pathJoin } from 'utils/misc'

import useReactRouter from 'use-react-router'
import { CloudProviders } from '../cloudProviders/model'
import { objSwitchCase } from 'utils/fp'
import BareosClusterRequirements from './bareos/BareosClusterRequirements'
import AwsClusterRequirements from './aws/AwsClusterRequirements'
import AzureClusterRequirements from './azure/AzureClusterRequirements'
import DocumentMeta from 'core/components/DocumentMeta'
import Theme from 'core/themes/model'

const switchCase: any = objSwitchCase
const requirementsMap = {
  [CloudProviders.VirtualMachine]: BareosClusterRequirements,
  [CloudProviders.PhysicalMachine]: BareosClusterRequirements,
  [CloudProviders.Aws]: AwsClusterRequirements,
  [CloudProviders.Azure]: AzureClusterRequirements,
}
type ValueOf<T> = T[keyof T]

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    display: 'grid',
    gridTemplateRows: '142px 1fr',
    gridGap: theme.spacing(2),
  },
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 242px)',
    gridGap: theme.spacing(3),
    minWidth: 1050,
  },
}))

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const AddClusterPage = () => {
  const classes = useStyles()
  const { history, location } = useReactRouter()
  const providerType =
    new URLSearchParams(location.search).get('type') || CloudProviders.VirtualMachine
  const [activeProvider, setActiveProvider] = useState(providerType)

  const handleNextView = (url) => {
    history.push(url)
  }

  const ActiveView: ValueOf<typeof requirementsMap> = useMemo(
    () => switchCase(requirementsMap)(activeProvider),
    [activeProvider],
  )
  return (
    <>
      <DocumentMeta title="Add Cluster" bodyClasses={['form-view']} />
      <FormWrapper
        className={classes.container}
        title="Select where to deploy your Kubernetes Cluster"
        backUrl={listUrl}
      >
        <div className={classes.root}>
          <CloudProviderCard
            active={activeProvider === CloudProviders.VirtualMachine}
            onClick={setActiveProvider}
            type={CloudProviders.VirtualMachine}
          />
          <CloudProviderCard
            active={activeProvider === CloudProviders.PhysicalMachine}
            onClick={setActiveProvider}
            type={CloudProviders.PhysicalMachine}
          />
          <CloudProviderCard
            active={activeProvider === CloudProviders.Aws}
            onClick={setActiveProvider}
            type={CloudProviders.Aws}
          />
          <CloudProviderCard
            active={activeProvider === CloudProviders.Azure}
            onClick={setActiveProvider}
            type={CloudProviders.Azure}
          />
        </div>
        <ActiveView onComplete={handleNextView} provider={activeProvider} />
      </FormWrapper>
    </>
  )
}

export default AddClusterPage

import React, { useMemo, useState } from 'react'
import { ClusterCloudPlatforms } from 'app/constants'
import FormWrapper from 'core/components/FormWrapper'
import { routes } from 'core/utils/routes'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/styles'
import CloudPlatformCard from 'k8s/components/common/CloudPlatformCard'
import ImportEKSRequirements from './ImportEKSRequirements'
import useReactRouter from 'use-react-router'
import DocumentMeta from 'core/components/DocumentMeta'
import { objSwitchCase } from 'utils/fp'
import ImportAKSRequirements from './ImportAKSRequirements'
import ImportGKERequirements from './importGKERequirements'
const switchCase: any = objSwitchCase

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

const requirementsMap = {
  [ClusterCloudPlatforms.EKS]: ImportEKSRequirements,
  [ClusterCloudPlatforms.AKS]: ImportAKSRequirements,
  [ClusterCloudPlatforms.GKE]: ImportGKERequirements,
}
type ValueOf<T> = T[keyof T]

const ImportClusterPage = () => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const [activePlatform, setActivePlatform] = useState<ClusterCloudPlatforms>(
    ClusterCloudPlatforms.EKS,
  )

  const ActiveView: ValueOf<typeof requirementsMap> = useMemo(
    () => switchCase(requirementsMap)(activePlatform),
    [activePlatform],
  )

  const handleNextView = (url) => {
    history.push(url)
  }

  return (
    <>
      <DocumentMeta title="Import Cluster" bodyClasses={['form-view']} />
      <FormWrapper
        className={classes.container}
        title="Select Cloud Platform of Clusters"
        backUrl={routes.cluster.list.path()}
      >
        <div className={classes.root}>
          <CloudPlatformCard
            active={activePlatform === ClusterCloudPlatforms.EKS}
            onClick={setActivePlatform}
            type={ClusterCloudPlatforms.EKS}
          />
          <CloudPlatformCard
            active={activePlatform === ClusterCloudPlatforms.AKS}
            onClick={setActivePlatform}
            type={ClusterCloudPlatforms.AKS}
          />
          <CloudPlatformCard
            active={activePlatform === ClusterCloudPlatforms.GKE}
            onClick={setActivePlatform}
            type={ClusterCloudPlatforms.GKE}
          />
        </div>
        <ActiveView onComplete={handleNextView} platform={activePlatform} />
      </FormWrapper>
    </>
  )
}

export default ImportClusterPage

import React, { useCallback } from 'react'
import DriftAnalysis from './drift-analysis'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'
import clsx from 'clsx'
import Button from 'core/elements/button'
import { routes } from 'core/utils/routes'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { rbacProfileBindingsActions } from '../actions'
import Progress from 'core/components/progress/Progress'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  summaryContainer: {
    background: theme.palette.grey['000'],
    display: 'grid',
    gridGap: theme.spacing(0.5),
    padding: theme.spacing(3),
    minWidth: 324,
    marginRight: theme.spacing(3),
  },
  summaryField: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  largeTopMargin: {
    marginTop: theme.spacing(2),
  },
  roleCounts: {
    display: 'grid',
    gridGap: theme.spacing(1),
  },
  button: {
    width: '100%',
  },
  analysis: {
    flexGrow: 1,
  },
}))

const DriftSummary = ({ wizardContext, createFn }) => {
  const classes = useStyles({})

  const deployCluster = useCallback(() => {
    return createFn({
      cluster: wizardContext.cluster,
      profileName: wizardContext.profile[0].name,
    })
  }, [wizardContext])

  return (
    <div className={classes.summaryContainer}>
      <Text variant="caption1">DRIFT SUMMARY</Text>
      <div className={clsx(classes.summaryField, classes.largeTopMargin)}>
        <Text variant="body2">Profile Name:</Text>
        <Text variant="caption1">{wizardContext.profile[0].name}</Text>
      </div>
      <div className={classes.summaryField}>
        <Text variant="body2">Cluster:</Text>
        <Text variant="caption1">{wizardContext.cluster[0].name}</Text>
      </div>
      <div className={clsx(classes.roleCounts, classes.largeTopMargin)}>
        <div className={classes.summaryField}>
          <Text variant="body2">Total Roles:</Text>
          <Text variant="caption1">{wizardContext.profile[0].roles.length}</Text>
        </div>
        <div className={classes.summaryField}>
          <Text variant="body2">Total Cluster Roles:</Text>
          <Text variant="caption1">{wizardContext.profile[0].clusterRoles.length}</Text>
        </div>
        <div className={classes.summaryField}>
          <Text variant="body2">Total Role Bindings:</Text>
          <Text variant="caption1">{wizardContext.profile[0].roleBindings.length}</Text>
        </div>
        <div className={classes.summaryField}>
          <Text variant="body2">Total Cluster Role Bindings:</Text>
          <Text variant="caption1">{wizardContext.profile[0].clusterRoleBindings.length}</Text>
        </div>
      </div>
      <Button onClick={deployCluster} className={clsx(classes.button, classes.largeTopMargin)}>
        Deploy Profile
      </Button>
    </div>
  )
}

const DriftAnalysisResult = ({ wizardContext }) => {
  const classes = useStyles({})
  const { history } = useReactRouter()

  const onComplete = useCallback(
    (success) => success && history.push(routes.rbac.profiles.list.path()),
    [history],
  )

  const [updateProfileBindingAction, creating] = useDataUpdater(
    rbacProfileBindingsActions.create,
    onComplete,
  )

  return (
    <Progress loading={creating} overlay renderContentOnMount>
      <div className={classes.container}>
        <DriftSummary wizardContext={wizardContext} createFn={updateProfileBindingAction} />
        <DriftAnalysis className={classes.analysis} analysisString={wizardContext.analysis} />
      </div>
    </Progress>
  )
}

export default DriftAnalysisResult

import React, { useMemo } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import RoleAnalysis from './role-analysis'
import ClusterRoleAnalysis from './cluster-role-analysis'
import RoleBindingAnalysis from './role-binding-analysis'
import { groupBy, prop } from 'ramda'
import ClusterRoleBindingAnalysis from './cluster-role-binding-analysis'
import clsx from 'clsx'

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    background: theme.palette.grey['000'],
    padding: theme.spacing(3),
  },
  overview: {
    background: theme.palette.blue[100],
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  overviewHeader: {
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
  headerText: {
    color: 'black',
    textTransform: 'uppercase',
    marginBottom: theme.spacing(0.5),
  },
  overviewBody: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(2),
  },
  headerOverviewCounter: {
    display: 'flex',
    justifyContent: 'space-between',
    width: 266,
  },
  overviewCounter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 258,
    margin: theme.spacing(0, 1),
  },
  verticallyCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
}))

const validJsonOrEmpty = (string) => {
  try {
    const parsedValue = JSON.parse(string)
    return parsedValue
  } catch {
    return ''
  }
}

const getResourceType = (path) => {
  const type = ['/role/', '/clusterRole/', '/roleBinding/', '/clusterRoleBinding'].find((str) =>
    path.includes(str),
  )
  return type.replace(/\//g, '')
}

const DriftAnalysis = ({ analysisString, className = '' }) => {
  const classes = useStyles({})
  const parsedList = useMemo(() => (analysisString ? JSON.parse(analysisString) : []), [
    analysisString,
  ])

  const mappedList = useMemo(
    () =>
      parsedList.map((item) => {
        const parsedValue = validJsonOrEmpty(item.newValue)
        return {
          ...item,
          newValue: parsedValue,
          oldValue: validJsonOrEmpty(item.oldValue),
          resourceType: getResourceType(item.path),
          name: parsedValue.metadata.name,
        }
      }),
    [parsedList],
  )

  const resourcesByType = useMemo(() => groupBy(prop('resourceType'), mappedList), [mappedList])

  return (
    <div className={clsx(classes.card, className)}>
      <Tabs useUrlHashes={false}>
        <Tab value="roles" label="Roles">
          <RoleAnalysis roles={resourcesByType['role'] || []} />
        </Tab>
        <Tab value="clusterroles" label="Cluster Roles">
          <ClusterRoleAnalysis clusterRoles={resourcesByType['clusterRole'] || []} />
        </Tab>
        <Tab value="rolebindings" label="Role Bindings">
          <RoleBindingAnalysis roleBindings={resourcesByType['roleBinding'] || []} />
        </Tab>
        <Tab value="clusterrolebindings" label="Cluster Role Bindings">
          <ClusterRoleBindingAnalysis
            clusterRoleBindings={resourcesByType['clusterRoleBinding'] || []}
          />
        </Tab>
      </Tabs>
    </div>
  )
}

export default DriftAnalysis

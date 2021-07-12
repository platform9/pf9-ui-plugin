import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { routes } from 'core/utils/routes'
import { ActionDataKeys } from 'k8s/DataKeys'
import { rbacProfileActions } from './actions'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { makeStyles, Tooltip } from '@material-ui/core'
import Theme from 'core/themes/model'
import Button from 'core/elements/button'
import ProfilePublishDialog from './profile-publish-dialog'
import SimpleLink from 'core/components/SimpleLink'
import Text from 'core/elements/text'

interface Params {
  status?: string
}

const useStyles = makeStyles<Theme, Params>((theme) => ({
  statusCircle: {
    marginRight: theme.spacing(0.25),
    color: ({ status }) =>
      ({
        published: theme.palette.green[500],
        draft: theme.palette.blue[500],
        errored: theme.palette.red[500],
      }[status]),
  },
  outlinedButton: {
    background: theme.palette.grey['000'],
    color: theme.palette.blue[500],
  },
}))

const StatusCircle = ({ status }) => {
  const classes = useStyles({ status })
  return (
    <FontAwesomeIcon className={classes.statusCircle} size="md" solid>
      circle
    </FontAwesomeIcon>
  )
}

const renderStatus = (status) => {
  const hasCircle = ['published', 'draft', 'errored'].includes(status)
  return (
    <>
      {hasCircle && <StatusCircle status={status} />}
      <span>{status}</span>
    </>
  )
}

const TypesTableCell = ({ profile }) => {
  return (
    <>
      {!!profile.roles.length && (
        <div>
          <Tooltip
            title={
              <>
                {profile.roles.map((role) => (
                  <Text variant="body2">{role}</Text>
                ))}
              </>
            }
          >
            <SimpleLink src="">Role</SimpleLink>
          </Tooltip>
        </div>
      )}
      {!!profile.clusterRoles.length && (
        <div>
          <Tooltip
            title={
              <>
                {profile.clusterRoles.map((clusterRole) => (
                  <Text variant="body2">{clusterRole}</Text>
                ))}
              </>
            }
          >
            <SimpleLink src="">Cluster Role</SimpleLink>
          </Tooltip>
        </div>
      )}
      {!!profile.roleBindings.length && (
        <div>
          <Tooltip
            title={
              <>
                {profile.roleBindings.map((roleBinding) => (
                  <Text variant="body2">{roleBinding}</Text>
                ))}
              </>
            }
          >
            <SimpleLink src="">Role Binding</SimpleLink>
          </Tooltip>
        </div>
      )}
      {!!profile.clusterRoleBindings.length && (
        <div>
          <Tooltip
            title={
              <>
                {profile.clusterRoleBindings.map((clusterRoleBinding) => (
                  <Text variant="body2">{clusterRoleBinding}</Text>
                ))}
              </>
            }
          >
            <SimpleLink src="">Cluster Role Binding</SimpleLink>
          </Tooltip>
        </div>
      )}
    </>
  )
}

const renderTypes = (_, profile) => <TypesTableCell profile={profile} />

const renderClusters = (clusters) => {
  return (
    <>
      {clusters.length ? (
        <Tooltip
          title={
            <>
              {clusters.map((cluster) => (
                <Text variant="body2">{cluster.name}</Text>
              ))}
            </>
          }
        >
          <SimpleLink src="">{clusters.length}</SimpleLink>
        </Tooltip>
      ) : (
        '-'
      )}
    </>
  )
}

const ProfileActionButton = ({ profile }) => {
  const classes = useStyles({})
  if (profile.action === 'deploy') {
    return (
      <SimpleLink src={routes.rbac.profiles.deploy.path({ name: profile.metadata.name })}>
        <Button textVariant="caption1" className={classes.actionButton}>
          Deploy
        </Button>
      </SimpleLink>
    )
  } else if (profile.action === 'publish') {
    return <ProfilePublishDialog profile={profile} />
  }
  return (
    <Button textVariant="caption1" disabled>
      Deploy
    </Button>
  )
}

const renderActionButton = (_, profile) => <ProfileActionButton profile={profile} />

export const options = {
  addUrl: routes.rbac.profiles.add.path(),
  addText: 'Add RBAC Profile',
  columns: [
    { id: 'metadata.name', label: 'Name' },
    { id: 'status.phase', label: 'Status', render: renderStatus },
    { id: 'clusters', label: 'Active Clusters', render: renderClusters },
    { id: 'roles', label: 'Types', render: renderTypes },
    { id: 'action', label: 'Action', render: renderActionButton },
  ],
  cacheKey: ActionDataKeys.RbacProfiles,
  deleteFn: rbacProfileActions.delete,
  // editUrl: (_, id) => routes.rbac.profiles.edit.path({ id }),
  // editCond: ([selectedRow]) => selectedRow.status === 'published',
  name: 'RbacProfiles',
  loaderFn: rbacProfileActions.list,
  title: 'RBAC Profiles',
  uniqueIdentifier: 'name',
  searchTargets: ['metadata.name'],
  multiSelection: false,
  pollingInterval: 1000 * 30,
  pollingCondition: (data) => {
    return !!data.find((profile) => {
      return profile.status.phase === 'creating'
    })
  },
  batchActions: [
    {
      icon: 'tasks',
      label: 'Manage Bindings',
      routeTo: (rows) => routes.rbac.profiles.deleteBindings.path({ name: rows[0].name }),
    },
  ],
}

// Try to: Add polling to createCRUDComponents
// Add conditional polling to PollingData
// Pass through conditional polling conditions through createCRUDComponents

const components = createCRUDComponents(options)
export default components.ListPage

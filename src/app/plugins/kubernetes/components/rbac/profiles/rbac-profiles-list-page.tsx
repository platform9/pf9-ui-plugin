import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { routes } from 'core/utils/routes'
import { ActionDataKeys } from 'k8s/DataKeys'
import { rbacProfilesActions } from './actions'
// import useDataLoader from 'core/hooks/useDataLoader'
// import { listTablePrefs } from 'app/constants'
// import { createUsePrefParamsHook } from 'core/hooks/useParams'
// import { pick } from 'ramda'
// import useScopedPreferences from 'core/session/useScopedPreferences'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { makeStyles } from '@material-ui/core'
import Theme from 'core/themes/model'
import Button from 'core/elements/button'
import ProfilePublishDialog from './profile-publish-dialog'
import SimpleLink from 'core/components/SimpleLink'

// const defaultParams = {
//   orderBy: 'name',
//   orderDirection: 'asc',
// }
// const usePrefParams = createUsePrefParamsHook('RbacProfiles', listTablePrefs)

// const ListPage = ({ ListContainer }) => {
//   return () => {
//     const { params, getParamsUpdater } = usePrefParams(defaultParams)
//     const [{ currentTenant }] = useScopedPreferences()
//     const [data, loading, reload] = useDataLoader(rbacProfilesActions.list, {
//       ...params,
//       namespace: currentTenant,
//     })
//     return (
//       <ListContainer
//         loading={loading}
//         reload={reload}
//         data={data}
//         getParamsUpdater={getParamsUpdater}
//         {...pick(listTablePrefs, params)}
//       />
//     )
//   }
// }

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
    { id: 'metadata.uid', label: 'Unique ID' },
    { id: 'action', label: 'Action', render: renderActionButton },
  ],
  cacheKey: ActionDataKeys.RbacProfiles,
  deleteFn: rbacProfilesActions.delete,
  // editUrl: (_, id) => routes.rbac.profiles.edit.path({ id }),
  // editCond: ([selectedRow]) => selectedRow.status === 'published',
  name: 'RbacProfiles',
  // profiles actions file needs to be imported & used somewhere
  loaderFn: rbacProfilesActions.list,
  title: 'RBAC Profiles',
  // uniqueIdentifier: 'metadata.uid',
  searchTargets: ['metadata.name'],
  multiSelection: false,
  // ListPage,
}

const components = createCRUDComponents(options)
export default components.ListPage

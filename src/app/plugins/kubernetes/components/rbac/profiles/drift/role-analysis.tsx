import React, { useState } from 'react'
// import React, { useMemo } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'
import ListTable from 'core/components/listTable/ListTable'
import { numApiResources, parseRoleRules } from './helpers'
import RoleAnalysisDialog from './role-analysis-dialog'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    background: theme.palette.grey['000'],
    padding: 40,
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
    alignItems: 'center',
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
  inspectIcon: {
    color: theme.palette.blue[500],
    cursor: 'pointer',
  },
}))

const opIcons = {
  add: <img src="/ui/images/icon-plus-square-solid@2x.png" />,
  replace: <img src="/ui/images/icon-exchange-square-solid@2x.png" />,
}

const renderOp = (op) => {
  return opIcons[op]
}

const InspectRoleButton = ({ rbac, role }) => {
  const classes = useStyles({})
  const [dialogOpened, setDialogOpened] = useState(false)

  return (
    <>
      <FontAwesomeIcon className={classes.inspectIcon} onClick={() => setDialogOpened(true)}>
        search-plus
      </FontAwesomeIcon>
      {dialogOpened && (
        <RoleAnalysisDialog rbac={rbac} role={role} onClose={() => setDialogOpened(false)} />
      )}
    </>
  )
}

const renderInspectButton = (rbac, role) => <InspectRoleButton rbac={rbac} role={role} />

const columns = [
  { id: 'op', label: '', render: renderOp },
  { id: 'name', label: 'Name' },
  { id: 'newValue.metadata.namespace', label: 'Namespace' },
  { id: 'numApis', label: 'APIs' },
  { id: 'rbac', label: '', render: renderInspectButton },
]

const RoleAnalysis = ({ roles }) => {
  const classes = useStyles({})

  const roleAnalysis = roles.map((role) => {
    const rules = parseRoleRules(role.newValue.rules)
    return {
      ...role,
      rbac: rules,
      numApis: numApiResources(rules),
    }
  })

  const newRoles = roleAnalysis.filter((role) => role.op === 'add')
  const replacedRoles = roleAnalysis.filter((role) => role.op === 'replace')

  return (
    <>
      <div className={classes.overview}>
        <div className={classes.overviewHeader}>
          <div className={classes.headerOverviewCounter}>
            <Text variant="h4" className={classes.headerText}>
              Total Roles Affected:
            </Text>
            <Text variant="body2">
              <b>{roleAnalysis.length}</b>
            </Text>
          </div>
        </div>
        <div className={classes.overviewBody}>
          <div className={classes.overviewCounter}>
            <Text variant="body2" className={classes.verticallyCenter}>
              <img src="/ui/images/icon-plus-square-solid@2x.png" className={classes.icon} />
              Added:
            </Text>
            <Text variant="body2">
              <b>{newRoles.length}</b>/{roleAnalysis.length}
            </Text>
          </div>
          <div className={classes.overviewCounter}>
            <Text variant="body2" className={classes.verticallyCenter}>
              <img src="/ui/images/icon-exchange-square-solid@2x.png" className={classes.icon} />
              Changed:
            </Text>
            <Text variant="body2">
              <b>{replacedRoles.length}</b>/{roleAnalysis.length}
            </Text>
          </div>
        </div>
      </div>
      <div>
        <ListTable
          showCheckboxes={false}
          searchTargets={['name']}
          columns={columns}
          data={roleAnalysis}
          rowsPerPage={10}
          uniqueIdentifier="path"
        />
      </div>
    </>
  )
}

export default RoleAnalysis

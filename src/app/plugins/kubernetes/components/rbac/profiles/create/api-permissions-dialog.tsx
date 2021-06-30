import React, { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogActions } from '@material-ui/core'
import Button from 'core/elements/button'
import SimpleLink from 'core/components/SimpleLink'
import { profilesHelpUrl, allKey } from 'app/constants'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Picklist from 'core/components/Picklist'
import { emptyArr, isNilOrEmpty } from 'utils/fp'
import { uniq, complement, update, includes, when, indexOf } from 'ramda'

interface ApiRules {
  verbs: string[]
  apiGroups: string[]
  resources: string[]
  resourceNames: string[]
}

export interface ApiPermissionsParams {
  name: string
  cluster: string
  namespace: string
  rules: ApiRules[]
}

interface IApiPermissionsDialog extends ApiPermissionsParams {
  onClose: () => void
  open: boolean
}

export const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    borderRadius: 4,
    background: theme.palette.grey['000'],
    padding: theme.spacing(2, 3),
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    color: theme.palette.grey[700],
  },
  policyDetails: {
    marginBottom: theme.spacing(2),
    '& > p': {
      margin: theme.spacing(1, 0),
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    '& > p > span': {
      minWidth: '70%',
    },
  },
  apiAccess: {
    maxHeight: 600,
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(2),
    color: theme.palette.grey[900],
  },
  titleLink: {
    textAlign: 'right',
    fontSize: 12,
    minWidth: 100,
  },
  filters: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'flex-start',
    marginTop: theme.spacing(-2),
    '& .MuiSelect-root.MuiSelect-select': {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
  },
  permissionGroup: {
    display: 'flex',
    flexFlow: 'row nowrap',
    backgroundColor: theme.palette.blue['100'],
    borderRadius: 2,
    padding: theme.spacing(0, 2),
    marginTop: theme.spacing(2),
    justifyContent: 'space-between',
  },
  permissionsResources: {
    display: 'flex',
    flexFlow: 'column nowrap',
    width: 240,
    minWidth: 240,
    '& > p': {
      margin: theme.spacing(1, 0),
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    '& > p > strong': {
      marginLeft: theme.spacing(1),
      display: 'flex',
      flexFlow: 'row wrap',
      whiteSpace: 'pre-wrap',
      width: 130,
    },
  },
  permissionsVerbs: {
    paddingLeft: theme.spacing(3),
    display: 'flex',
    flexFlow: 'row wrap',
    alignItems: 'center',
    flexGrow: 1,
  },
  verb: {
    borderRadius: 4,
    padding: theme.spacing(0.5, 2),
    margin: theme.spacing(0.5, 1),
    backgroundColor: theme.palette.blue['200'],
  },
}))

// The modal is technically inside the row, so clicking anything inside
// the modal window will cause the table row to be toggled.
const stopPropagation = (e) => e.stopPropagation()

const PermissionGroup = ({ verbs, apiGroups = [], resources = [], resourceNames }: ApiRules) => {
  const classes = useStyles()
  return (
    <div className={classes.permissionGroup}>
      <div className={classes.permissionsResources}>
        <p>
          API Group: <strong>{updateApiGroupsWithCore(apiGroups).join(', ')}</strong>
        </p>
        <p>
          Resources: <strong>{resources.join(', ')}</strong>
        </p>
      </div>
      <div className={classes.permissionsVerbs}>
        {verbs.map((verb) => (
          <div key={verb} className={classes.verb}>
            {verb}
          </div>
        ))}
      </div>
    </div>
  )
}

const updateApiGroupsWithCore = (apiGroups) =>
  when<string[], string[]>(includes(''), update(indexOf('', apiGroups), 'core'), apiGroups)

const ApiPermissionsDialog = ({
  open,
  onClose,
  name,
  cluster,
  namespace,
  rules = [],
}: IApiPermissionsDialog) => {
  const classes = useStyles()
  const [currentApi, changeCurrentApi] = useState(allKey)
  const [currentVerb, changeCurrentVerb] = useState(allKey)
  const apis = useMemo(
    () =>
      rules
        .reduce(
          (acc, apiRuleGroup) => {
            return uniq([...acc, ...(apiRuleGroup.apiGroups || emptyArr)])
          },
          ['core'],
        )
        .filter(complement(isNilOrEmpty)),
    [rules],
  )
  const verbs = useMemo(
    () =>
      rules
        .reduce((acc, apiRuleGroup) => {
          return uniq([...acc, ...(apiRuleGroup.verbs || emptyArr)])
        }, emptyArr)
        .filter(complement(isNilOrEmpty)),
    [rules],
  )
  const filteredRules = useMemo(() => {
    return rules.filter(
      (rule) =>
        (currentApi === allKey ||
          (rule.apiGroups && updateApiGroupsWithCore(rule.apiGroups).includes(currentApi))) &&
        (currentVerb === allKey || (rule.verbs && rule.verbs.includes(currentVerb))),
    )
  }, [rules, currentApi, currentVerb])

  useEffect(() => {
    if (!open) {
      // Reset filters state when closing the dialog
      changeCurrentApi(allKey)
      changeCurrentVerb(allKey)
    }
  }, [open])

  return (
    <Dialog
      onClick={stopPropagation}
      maxWidth="md"
      fullWidth
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent>
        <div className={classes.policyDetails}>
          <header className={classes.header}>
            <Text variant="body1">
              Policy details: <strong>${name}</strong>
            </Text>
            <SimpleLink className={classes.titleLink} src={profilesHelpUrl}>
              Profiles Help
            </SimpleLink>
          </header>
          <p>
            Cluster: <span>{cluster}</span>
          </p>
          <p>
            Namespace: <span>{namespace}</span>
          </p>
        </div>
        <div className={classes.apiAccess}>
          <header className={classes.header}>
            <Text variant="body1">API Access/Permissions</Text>
          </header>
          <div className={classes.filters}>
            <Picklist
              /*
            // @ts-ignore */
              name={'apis'}
              allLabel={'All APIs'}
              value={currentApi}
              onChange={changeCurrentApi}
              options={apis}
            />
            &nbsp;
            <Picklist
              /*
            // @ts-ignore */
              name={'verbs'}
              allLabel={'All verbs'}
              value={currentVerb}
              onChange={changeCurrentVerb}
              options={verbs}
            />
          </div>
          {filteredRules.map((rule, idx) => (
            <PermissionGroup key={idx} {...rule} />
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ApiPermissionsDialog

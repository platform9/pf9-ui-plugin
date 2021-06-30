import WizardStep from 'core/components/wizard/WizardStep'
import React, { useState, useCallback, useMemo } from 'react'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { except } from 'utils/fp'
import { RolesListTable } from 'k8s/components/rbac/profiles/create/roles-step'
import useDataLoader from 'core/hooks/useDataLoader'
import {
  roleActions,
  roleBindingActions,
  clusterRoleActions,
  clusterRoleBindingActions,
} from 'k8s/components/rbac/actions'
import { allKey, profilesHelpUrl } from 'app/constants'
import { RoleBindingsListTable } from 'k8s/components/rbac/profiles/create/role-bindings-step'
import { ClusterRolesListTable } from 'k8s/components/rbac/profiles/create/cluster-roles-step'
import { ClusterRoleBindingsListTable } from 'k8s/components/rbac/profiles/create/cluster-role-bindings-step'
import useStyles from './useStyles'
import SimpleLink from 'core/components/SimpleLink'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { withStyles } from '@material-ui/styles'
import {
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
} from '@material-ui/core'

const defaultParams = {
  masterNodeClusters: true,
  clusterId: allKey,
  namespace: allKey,
}

enum Panels {
  Roles,
  ClusterRoles,
  RoleBindings,
  ClusterRoleBindings,
}
const defaultActivePanels = []

const Accordion = withStyles((theme) => ({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    borderWidth: '1px 0',
    borderColor: theme.palette.grey['500'],
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    // '&$expanded': {
    //   margin: 'auto',
    // },
  },
  expanded: {},
}))(MuiAccordion)

const AccordionSummary = withStyles((theme) => ({
  root: {
    flexFlow: 'row-reverse nowrap',
    backgroundColor: 'rgb(255, 255, 255)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    padding: 0,
    '&$expanded': {
      minHeight: 56,
    },
    '& .MuiAccordionSummary-expandIcon': {
      marginRight: theme.spacing(2),
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
}))(MuiAccordionSummary)

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: 0,
    '& > div': {
      width: '100%',
    },
  },
}))(MuiAccordionDetails)

const ReviewStep = ({ wizardContext }) => {
  const classes = useStyles()
  const {
    profileName,
    baseCluster,
    roles: selectedRoles,
    clusterRoles: selectedClusterRoles,
    roleBindings: selectedRoleBindings,
    clusterRoleBindings: selectedClusterRoleBindings,
  } = wizardContext
  const [activePanels, setActivePanels] = useState<Panels[]>(defaultActivePanels)
  const togglePanel = useCallback(
    (panel) => () => {
      setActivePanels(
        activePanels.includes(panel) ? except(panel, activePanels) : [panel, ...activePanels],
      )
    },
    [activePanels],
  )
  const [roles] = useDataLoader(roleActions.list, defaultParams)
  const [clusterRoles] = useDataLoader(clusterRoleActions.list, defaultParams)
  const [roleBindings] = useDataLoader(roleBindingActions.list, defaultParams)
  const [clusterRoleBindings] = useDataLoader(clusterRoleBindingActions.list, defaultParams)
  const filteredRoles = useMemo(() => roles.filter(({ id }) => !!selectedRoles[id]), [
    roles,
    selectedRoles,
  ])
  const filteredClusterRoles = useMemo(
    () => clusterRoles.filter(({ id }) => !!selectedClusterRoles[id]),
    [clusterRoles, selectedClusterRoles],
  )
  const filteredRoleBindings = useMemo(
    () => roleBindings.filter(({ id }) => !!selectedRoleBindings[id]),
    [roleBindings, selectedRoleBindings],
  )
  const filteredClusterRoleBindings = useMemo(
    () => clusterRoleBindings.filter(({ id }) => !!selectedClusterRoleBindings[id]),
    [clusterRoleBindings, selectedClusterRoleBindings],
  )

  return (
    <WizardStep label="Review" stepId="review">
      <FormFieldCard
        className={classes.listBox}
        title={'RBAC Profile - Review'}
        link={<SimpleLink src={profilesHelpUrl}>Profiles Help</SimpleLink>}
      >
        <p>
          The selected RBAC Policies will be added to your list of <strong>Draft Profiles</strong>.
          You can review and customize the profile after the draft is created. Once the profile is
          customized to your requirements you can publish the profile for use.
        </p>
        <br />
        <p>
          Profile Name: <strong>{profileName}</strong>
          <br />
          Base Cluster: <strong>{baseCluster}</strong>
        </p>
        <br />
        {filteredRoles.length ? (
          <Accordion
            expanded={activePanels.includes(Panels.Roles)}
            onClick={togglePanel(Panels.Roles)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <div className={classes.accordionTitle}>
                {`Roles`} <span>{`(${filteredRoles.length} total)`}</span>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <RolesListTable data={filteredRoles} compactTable />
            </AccordionDetails>
          </Accordion>
        ) : null}
        {filteredClusterRoles.length ? (
          <Accordion
            expanded={activePanels.includes(Panels.ClusterRoles)}
            onClick={togglePanel(Panels.ClusterRoles)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <div className={classes.accordionTitle}>
                {`Cluster Roles`} <span>{`(${filteredClusterRoles.length} total)`})</span>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <ClusterRolesListTable data={filteredClusterRoles} compactTable />
            </AccordionDetails>
          </Accordion>
        ) : null}
        {filteredRoleBindings.length ? (
          <Accordion
            expanded={activePanels.includes(Panels.RoleBindings)}
            onClick={togglePanel(Panels.RoleBindings)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <div className={classes.accordionTitle}>
                {`Role Bindings`} <span>{`(${filteredRoleBindings.length} total)`})</span>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <RoleBindingsListTable data={filteredRoleBindings} compactTable />
            </AccordionDetails>
          </Accordion>
        ) : null}
        {filteredClusterRoleBindings.length ? (
          <Accordion
            expanded={activePanels.includes(Panels.ClusterRoleBindings)}
            onClick={togglePanel(Panels.ClusterRoleBindings)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <div className={classes.accordionTitle}>
                {`Cluster Role Bindings`}{' '}
                <span>{`(${filteredClusterRoleBindings.length} total)`})</span>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <ClusterRoleBindingsListTable data={filteredClusterRoleBindings} compactTable />
            </AccordionDetails>
          </Accordion>
        ) : null}
      </FormFieldCard>
    </WizardStep>
  )
}

export default ReviewStep

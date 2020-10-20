import React from 'react'

export const templateTitle = 'One Click'

const OneClickVirtualMachineCluster = (props) => {
  return (
    <ValidatedForm
      fullWidth
      initialValues={wizardContext}
      onSubmit={setWizardContext}
      triggerSubmit={setupValidator(onNext)}
      elevated={false}
    >
      {/* <PollingData loading={loading} onReload={reload} hidden /> */}
      {/* Cluster Name */}
      <FormFieldCard title="Name your Kubernetes Cluster">
        <TextField
          id="name"
          label="Name"
          info="Name of the cluster"
          onChange={(value) => setWizardContext({ name: value })}
          required
        />
      </FormFieldCard>
      <FormFieldCard
        title="Connect BareOS Nodes"
        link={
          <div>
            <FontAwesomeIcon className={classes.blueIcon} size="md">
              file-alt
            </FontAwesomeIcon>{' '}
            <ExternalLink url={pmkCliPrepNodeLink}>See all PF9CTL options</ExternalLink>
          </div>
        }
      >
        <DownloadCliWalkthrough />
      </FormFieldCard>
      <FormFieldCard
        title="Connected Nodes"
        link={
          <div>
            <FontAwesomeIcon className={classes.blueIcon} size="md">
              ball-pile
            </FontAwesomeIcon>{' '}
            <ExternalLink url={pmkCliOverviewLink}>Not Seeing Any Nodes?</ExternalLink>
          </div>
        }
      >
        <div className={classes.innerWrapper}>
          {/* Master nodes */}
          {/* <Text>Select one or more nodes to add to the cluster as <strong>master</strong> nodes</Text> */}
          <ClusterHostChooser
            selection="none"
            filterFn={allPass([isConnected, isUnassignedNode])}
            pollForNodes
          />
        </div>
      </FormFieldCard>
    </ValidatedForm>
  )
}

export default OneClickVirtualMachineCluster

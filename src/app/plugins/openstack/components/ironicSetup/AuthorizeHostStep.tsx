import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import useParams from 'core/hooks/useParams'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import ListTableField from 'core/components/validatedForm/ListTableField'
import useDataLoader from 'core/hooks/useDataLoader'
import PollingData from 'core/components/PollingData'
import { IUseDataLoader } from 'k8s/components/infrastructure/nodes/model'
import { ResMgrHost } from 'k8s/components/infrastructure/common/model'

// Put any for now to let me proceed
interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
  title: string
}

const columns = [
  { id: 'info.hostname', label: 'Hostname' },
  { id: 'ipPreview', label: 'IP Address' },
  { id: 'info.os_info', label: 'Operating System' },
]

const AuthorizeHostStep = ({ wizardContext, setWizardContext, onNext, title }: Props) => {
  const { getParamsUpdater } = useParams(wizardContext)

  const [hosts, hostsLoading, reloadHosts]: IUseDataLoader<ResMgrHost> = useDataLoader(loadResMgrHosts) as any

  // Minor bug: when the list of hosts is refreshed, prior selection
  // is unselected (all objects are replaced, old selected is no
  // longer there) but old selection is still valid in the wizard context.
  return (
    <>
      <div>Authorize the node to become the controller for MetalStack</div>
      <ValidatedForm
        initialValues={wizardContext}
        onSubmit={setWizardContext}
        triggerSubmit={onNext}
        title={title}
      >
        {({ setFieldValue, values }) => (
          <>
            <PollingData
              loading={hostsLoading}
              onReload={reloadHosts}
              refreshDuration={1000 * 60}
            />
            <ListTableField
              id='selectedHost'
              data={hosts}
              onChange={getParamsUpdater('selectedHost')}
              columns={columns}
              loading={false}
            />
          </>
        )}
      </ValidatedForm>
    </>
  )
}

export default AuthorizeHostStep

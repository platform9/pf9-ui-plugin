import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import useParams from 'core/hooks/useParams'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import ListTableField from 'core/components/validatedForm/ListTableField'
import useDataLoader from 'core/hooks/useDataLoader'
import PollingData from 'core/components/PollingData'
import { IUseDataLoader } from 'k8s/components/infrastructure/nodes/model'
import { ResMgrHost } from 'k8s/components/infrastructure/common/model'
import { MessageTypes } from 'core/components/notifications/model'
import { useToast } from 'core/providers/ToastProvider'
import { addRole } from 'openstack/components/resmgr/actions'

// Put any for now to let me proceed
interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
  title: string
  setSubmitting: any
}

const columns = [
  { id: 'info.hostname', label: 'Hostname' },
  { id: 'ipPreview', label: 'IP Address' },
  { id: 'info.os_info', label: 'Operating System' },
]

const AuthorizeHostStep = ({ wizardContext, setWizardContext, onNext, title, setSubmitting }: Props) => {
  const { getParamsUpdater } = useParams(wizardContext)
  const showToast = useToast()

  const [hosts, hostsLoading, reloadHosts]: IUseDataLoader<ResMgrHost> = useDataLoader(loadResMgrHosts) as any

  const submitStep = async (context) => {
    try {
      setSubmitting(true)
      await addRole(context.selectedHost[0].id, 'pf9-onboarding', {})
    } catch (err) {
      setSubmitting(false)
      showToast(err, MessageTypes.error)
      return false
    }

    setSubmitting(false)
    return true
  }

  // Minor bug: when the list of hosts is refreshed, prior selection
  // is unselected (all objects are replaced, old selected is no
  // longer there) but old selection is still valid in the wizard context.
  return (
    <>
      <div>Authorize the node to become the Bare Metal controller</div>
      <ValidatedForm
        initialValues={wizardContext}
        onSubmit={setWizardContext}
        triggerSubmit={onNext}
        apiCalls={submitStep}
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

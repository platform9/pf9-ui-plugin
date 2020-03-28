// libs
import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import useParams from 'core/hooks/useParams'
// import { makeStyles } from '@material-ui/styles'
// import { Theme } from '@material-ui/core'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import ListTableField from 'core/components/validatedForm/ListTableField'
import useDataLoader from 'core/hooks/useDataLoader'

// const useStyles = makeStyles((theme: Theme) => ({
//   text: {
//     marginTop: theme.spacing(1),
//     marginLeft: theme.spacing(1),
//   },
//   bold: {
//     fontWeight: 'bold',
//   }
// }))

// Put any for now to let me proceed
interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
  title: string
}

const IronicSetupPage = ({ wizardContext, setWizardContext, onNext, title }: Props) => {
  const { getParamsUpdater } = useParams(wizardContext)

  const [hosts, hostsLoading] = useDataLoader(loadResMgrHosts)

  const columns = [
    { id: 'info.hostname', label: 'Hostname' },
    { id: 'ipPreview', label: 'IP Address' },
    { id: 'info.os_info', label: 'Operating System' },
  ]

  return (
    <ValidatedForm
      initialValues={wizardContext}
      onSubmit={setWizardContext}
      triggerSubmit={onNext}
      title={title}
    >
      {({ setFieldValue, values }) => (
        <>
          <ListTableField
            id='selectedHost'
            data={hosts}
            onChange={getParamsUpdater('selectedHost')}
            columns={columns}
            loading={hostsLoading}
          />
        </>
      )}
    </ValidatedForm>
  )
}

export default IronicSetupPage

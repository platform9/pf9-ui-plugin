import React from 'react'
import Button from 'core/elements/button'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/styles'
import { ErrorMessage } from 'core/components/validatedForm/ErrorMessage'
import UploadGoogleJson from './UploadGoogleJson'
import Text from 'core/elements/text'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import TextField from 'core/components/validatedForm/TextField'
import { customValidator, requiredValidator } from 'core/utils/fieldValidators'

const useStyles = makeStyles((theme: Theme) => ({
  inCardSubmit: {
    marginTop: theme.spacing(2.5),
  },
  fullWidth: {
    width: '100% !important',
  },
  wizardLabel: {
    margin: theme.spacing(1, 0),
  },
}))

const customCodeMirrorOptions = {
  mode: 'json',
}

const codeMirrorValidations = [
  requiredValidator,
  customValidator((json) => {
    try {
      const parseableString = json.replace(/[^\S\r\n]/g, ' ')
      JSON.parse(parseableString)
      return true
    } catch (err) {
      console.log(err)
      return false
    }
  }, 'Provided JSON code is invalid'),
]

interface Props {
  wizardContext: any
  setWizardContext: any
  showSubmitInCard: boolean
  updateWizard: boolean
  errorMessage: string
}

const GoogleCloudProviderFields = ({
  wizardContext,
  setWizardContext,
  showSubmitInCard = false,
  updateWizard = false,
  errorMessage = '',
}: Props) => {
  const { inCardSubmit, fullWidth, wizardLabel } = useStyles({})

  return (
    <>
      <TextField
        id="name"
        label="Cloud Provider Name"
        onChange={(value) => setWizardContext({ name: value })}
        value={wizardContext.name}
        info="Name for Cloud Provider"
        disabled={updateWizard}
        required
      />
      <Text variant="caption1" className={wizardLabel}>
        Cloud Provider JSON
      </Text>
      <Text variant="body2">Copy/Paste or upload your JSON key below.</Text>
      <CodeMirror
        id="json"
        label="JSON"
        options={customCodeMirrorOptions}
        onChange={(value) => setWizardContext({ json: value })}
        value={wizardContext.json}
        className={fullWidth}
        validations={codeMirrorValidations}
      />
      <UploadGoogleJson onChange={(value) => setWizardContext({ json: value })} />
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {showSubmitInCard && (
        <div className={inCardSubmit}>
          <Button disabled type="submit">
            Update Cloud Provider
          </Button>
        </div>
      )}
    </>
  )
}

export default GoogleCloudProviderFields

import React, { useState } from 'react'
import TextField from 'core/components/validatedForm/TextField'
import Info from 'core/components/validatedForm/Info'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import MuiButton from '@material-ui/core/Button'
import Button from 'core/elements/button'
import axios from 'axios'
import downloadFile from 'core/utils/downloadFile'
import { iamPolicyLink } from 'k8s/links'
import Alert from 'core/components/Alert'
import Text from 'core/elements/text'

const useStyles = makeStyles((theme: Theme) => ({
  bullets: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  bullet: {
    width: '50%',
  },
  // Weird but works to make sure that the bullets aren't overlapping with text
  bulletText: {
    paddingRight: theme.spacing(3),
    display: 'list-item',
  },
  downloadIcon: {
    marginRight: theme.spacing(0.5),
  },
  iamInfo: {
    marginBottom: theme.spacing(4),
  },
  inCardSubmit: {
    marginTop: theme.spacing(2.5),
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
  toggleIamPolicy: boolean
  showSubmitInCard: boolean
  optionalFields: boolean
}

const downloadIAMPolicy = async (setState) => {
  try {
    setState({ status: '', message: '' })
    const response = await axios.get(iamPolicyLink)
    const fileData = JSON.stringify(response.data)
    downloadFile({
      filename: 'aws-policy.json',
      contents: fileData,
    })
  } catch (err) {
    setState({ status: 'error', message: err.message })
  }
}

const AwsCloudProviderFields = ({
  wizardContext,
  setWizardContext,
  toggleIamPolicy = false,
  showSubmitInCard = false,
  optionalFields = false,
}: Props) => {
  const { bullets, bullet, bulletText, downloadIcon, iamInfo, inCardSubmit } = useStyles({})
  const [downloadState, setDownloadState] = useState({ status: '', message: '' })

  return (
    <>
      <Info
        error={downloadState.status === 'error'}
        title={toggleIamPolicy ? 'IAM Policy' : ''}
        expanded={false}
        className={iamInfo}
      >
        <div>
          The following permissions are required on your AWS account in order to deploy fully
          automated Managed Kubernetes clusters:
        </div>
        <ul className={bullets}>
          <li className={bullet}>
            <span className={bulletText}>ELB Management</span>
          </li>
          <li className={bullet}>
            <span className={bulletText}>EC2 Instance Management</span>
          </li>
          <li className={bullet}>
            <span className={bulletText}>Route 53 DNS Configuration</span>
          </li>
          <li className={bullet}>
            <span className={bulletText}>EBS Volume Management</span>
          </li>
          <li className={bullet}>
            <span className={bulletText}>
              Access to 2 or more Availability Zones within the region
            </span>
          </li>
          <li className={bullet}>
            <span className={bulletText}>VPC Management</span>
          </li>
        </ul>
        <MuiButton variant="outlined" onClick={() => downloadIAMPolicy(setDownloadState)}>
          <FontAwesomeIcon size="md" className={downloadIcon}>
            download
          </FontAwesomeIcon>
          <Text className="no-text-transform" variant="buttonSecondary">
            Download IAM Policy
          </Text>
        </MuiButton>
        {downloadState.status === 'error' && (
          <Alert small variant="error" message={downloadState.message} />
        )}
      </Info>
      <TextField
        id="name"
        label="Cloud Provider Name"
        onChange={(value) => setWizardContext({ name: value })}
        value={wizardContext.name}
        info="Name for Cloud Provider"
        required={!optionalFields}
      />
      <TextField
        id="key"
        label="Access Key ID"
        onChange={(value) => setWizardContext({ key: value })}
        value={wizardContext.key}
        info="AWS IAM Access Key"
        required={!optionalFields}
      />
      <TextField
        id="secret"
        label="Secret Access Key"
        onChange={(value) => setWizardContext({ secret: value })}
        value={wizardContext.secret}
        info="IAM User Secret Key"
        type="password"
        required={!optionalFields}
      />
      {showSubmitInCard && (
        <div className={inCardSubmit}>
          <Button type="submit">Update Cloud Provider</Button>
        </div>
      )}
    </>
  )
}

export default AwsCloudProviderFields

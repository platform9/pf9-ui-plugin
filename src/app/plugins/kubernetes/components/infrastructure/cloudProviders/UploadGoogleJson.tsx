import React, { useState, useCallback } from 'react'
import SimpleLink from 'core/components/SimpleLink'
import { Dialog } from '@material-ui/core'
import Button from 'core/elements/button'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import { useDropzone } from 'react-dropzone'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import withFormContext from 'core/components/validatedForm/withFormContext'

interface Props {
  onChange: (value: any) => void
  fileNameUpdater?: (value: any) => void
  id?: string
}

const useStyles = makeStyles((theme: Theme) => ({
  dialogContainer: {
    padding: theme.spacing(1, 3),
  },
  dialogHeader: {
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
  dialogContent: {
    margin: theme.spacing(2, 0, 8),
    background: theme.palette.grey[100],
    display: 'flex',
    flexDirection: 'column',
    height: 208,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  uploadIcon: {
    fontSize: 40,
    color: theme.palette.grey[300],
  },
  dropzoneText: {
    margin: theme.spacing(2, 0, 1),
  },
  button: {
    background: theme.palette.grey['000'],
    border: `1px solid ${theme.palette.blue[500]}`,
    color: theme.palette.blue[500],
  },
}))

const UploadGoogleJson = ({ onChange, fileNameUpdater }: Props) => {
  const classes = useStyles({})
  const [showModal, setModal] = useState(false)

  const handleOpen = () => setModal(true)
  const handleClose = () => setModal(false)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    const reader = new FileReader()

    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    reader.onload = () => {
      const text = reader.result as string
      onChange(text)
      if (fileNameUpdater) {
        fileNameUpdater(file.name)
      }
      handleClose()
    }
    reader.readAsText(file)
  }, [])
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.json', maxFiles: 1 })

  const renderModalContent = () => (
    <Dialog open fullWidth maxWidth="sm" onClose={handleClose}>
      <div className={classes.dialogContainer}>
        <Text variant="body1" className={classes.dialogHeader}>
          Upload GCP Service Account JSON Key
        </Text>
        <div className={classes.dialogContent} {...getRootProps()}>
          <input {...getInputProps()} />
          <div>
            <FontAwesomeIcon className={classes.uploadIcon}>upload</FontAwesomeIcon>
            <div className={classes.dropzoneText}>
              <Text variant="body2">Drag and drop file (.json) here</Text>
              <Text variant="body2">or</Text>
            </div>
            <Button className={classes.button}>Browse</Button>
          </div>
        </div>
      </div>
    </Dialog>
  )

  return (
    <div>
      {showModal && renderModalContent()}
      <SimpleLink src="" onClick={handleOpen}>
        <Button>Upload JSON File</Button>
      </SimpleLink>
    </div>
  )
}

export default withFormContext(UploadGoogleJson) as React.FC<Props>

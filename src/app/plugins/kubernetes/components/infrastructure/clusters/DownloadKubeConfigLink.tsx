import React, { useState } from 'react'
import { ICluster } from './model'
import SimpleLink from 'core/components/SimpleLink'
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core'
import DownloadKubeConfigForm from 'k8s/components/apiAccess/kubeConfig/DownloadKubeConfigForm'

interface Props {
  cluster: ICluster
}

const DownloadKubeConfigLink = ({ cluster }: Props) => {
  const [showModal, setModal] = useState(false)

  const handleOpen = () => setModal(true)
  const handleClose = () => setModal(false)

  const renderModalContent = () => (
    <Dialog open fullWidth maxWidth="xs" onClose={handleClose}>
      <DialogTitle>Download kubeconfig</DialogTitle>
      <DialogContent>
        <DownloadKubeConfigForm cluster={cluster} onSubmit={handleClose} />
      </DialogContent>
    </Dialog>
  )

  return (
    <div>
      {showModal && renderModalContent()}
      <SimpleLink src="" onClick={handleOpen}>kubeconfig</SimpleLink>
    </div>
  )
}

export default DownloadKubeConfigLink

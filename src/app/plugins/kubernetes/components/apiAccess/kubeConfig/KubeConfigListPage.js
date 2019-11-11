import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import kubeConfigActions from './actions'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import DownloadDialog from './DownloadDialog'
import SimpleLink from 'core/components/SimpleLink'

const useStyles = makeStyles(theme => ({
  link: {
    display: 'block',
    width: 'fit-content',
  },
  clusterConfig: {
    marginTop: theme.spacing(5),
  },
}))

const KubeConfigListPage = () => {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const classes = useStyles()

  const handleClickDownload = (row) => {
    setDialogOpen(true)
  }
  const handleDialogClose = () => setDialogOpen(false)

  const columns = getColumns(handleClickDownload)

  const options = {
    cacheKey: 'kubeconfig',
    uniqueIdentifier: 'cluster',
    loaderFn: kubeConfigActions.list,
    columns,
    name: 'Kubeconfig',
    compactTable: true,
    blankFirstColumn: true,
    multiSelection: false,
    onSelect: handleClickDownload,
  }

  const { ListPage } = createCRUDComponents(options)

  return (
    <>
      <h2>Download kubeconfig</h2>
      <p>The kubeconfig file is required to authenticate with a cluster and switch between multiple clusters between multiple users while using the kubectl command line.</p>
      <SimpleLink className={classes.link} href="https://kubernetes.io/docs/user-guide/kubectl-overview/">
        Learn more about kubectl
      </SimpleLink>
      <SimpleLink className={classes.link} href="https://kubernetes.io/docs/user-guide/kubeconfig-file/">
        Learn more about kubeconfig
      </SimpleLink>
      <ListPage />
      <p className={classes.clusterConfig}>Select a cluster above to populate its kubeconfig below.</p>
      <ValidatedForm>
        <TextField id="config" rows={9} multiline />
      </ValidatedForm>
      <DownloadDialog onClose={handleDialogClose} isDialogOpen={isDialogOpen} />
    </>
  )
}

const getColumns = (handleClickDownload) => [
  { id: 'cluster', label: 'Cluster' },
  {
    id: 'kubeConfig',
    label: 'kubeconfig',
    render: (contents, row) => kubeConfigLink(row, handleClickDownload),
  },
  { id: 'url', label: 'URL' },
]

const kubeConfigLink = (row, handleClickDownload) =>
  <SimpleLink onClick={() => handleClickDownload(row)}>Download kubeconfig</SimpleLink>

export default KubeConfigListPage

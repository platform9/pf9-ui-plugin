import React, { useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import kubeConfigActions from './actions'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import DownloadDialog from './DownloadDialog'
import SimpleLink from 'core/components/SimpleLink'
import useToggler from 'core/hooks/useToggler'

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
  const [isDialogOpen, toggleDialog] = useToggler()
  const classes = useStyles()

  const columns = getColumns(toggleDialog)

  const options = useMemo(() => ({
    cacheKey: 'kubeconfig',
    uniqueIdentifier: 'cluster',
    loaderFn: kubeConfigActions.list,
    columns,
    name: 'Kubeconfig',
    compactTable: true,
    blankFirstColumn: true,
    multiSelection: false,
    onSelect: toggleDialog,
  }), [toggleDialog])

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
      <DownloadDialog onClose={toggleDialog} isDialogOpen={isDialogOpen} />
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

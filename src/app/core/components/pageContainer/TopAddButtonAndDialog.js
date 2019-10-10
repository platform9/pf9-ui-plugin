import React, { Fragment, useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import useReactRouter from 'use-react-router'
import CreateButton from 'core/components/buttons/CreateButton'
import PageContainerHeader from 'core/components/pageContainer/PageContainerHeader'

const TopAddButtonAndDialog = ({ addUrl, addText, renderAddDialog, reload }) => {
  const { history } = useReactRouter()
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const handleAddDialogClose = useCallback(() => {
    setAddDialogOpen(false)
    reload()
  }, [reload])

  const addButton = useMemo(() => (
    <PageContainerHeader>
      <CreateButton onClick={() => renderAddDialog ? setAddDialogOpen(true) : history.push(addUrl)}>
        {addText}
      </CreateButton>
    </PageContainerHeader>
  ), [history, addUrl, addText])

  const isButtonVisible = addUrl || !!renderAddDialog
  const isAddDialogOpen = !!renderAddDialog && addDialogOpen

  return (
    <Fragment>
      {isButtonVisible && addButton}
      {isAddDialogOpen && renderAddDialog(handleAddDialogClose)}
    </Fragment>
  )
}

TopAddButtonAndDialog.propTypes = {
  addUrl: PropTypes.string,
  addText: PropTypes.string,
  renderAddDialog: PropTypes.func,
  reload: PropTypes.func,
}

export default TopAddButtonAndDialog

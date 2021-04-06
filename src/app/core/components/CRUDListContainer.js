import { defaultUniqueIdentifier } from 'app/constants'
import { emptyArr, emptyObj, isNilOrEmpty } from 'app/utils/fp'
import CreateButton from 'core/components/buttons/CreateButton'
import PageContainerHeader from 'core/components/pageContainer/PageContainerHeader'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useToggler from 'core/hooks/useToggler'
import PropTypes from 'prop-types'
import { path, pluck } from 'ramda'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import useReactRouter from 'use-react-router'
import { pathJoin } from 'utils/misc'
import ConfirmationDialog from './ConfirmationDialog'
import DropdownButton from './DropdownButton'

const CRUDListContainer = ({
  children,
  reload,
  nameProp,
  addText,
  addButton: AddButton,
  addButtonConfigs,
  AddDialog,
  EditDialog,
  DeleteDialog,
  addUrl,
  editUrl,
  deleteFn,
  uniqueIdentifier,
}) => {
  const [handleRemove, deleting] = deleteFn ? useDataUpdater(deleteFn, reload) : emptyArr
  const uniqueIdentifierPath = uniqueIdentifier.split('.')
  const { history } = useReactRouter()
  const deletePromise = useRef()
  const [showingConfirmDialog, toggleConfirmDialog] = useToggler()
  const [showingEditDialog, toggleEditDialog] = useToggler()
  const [showingAddDialog, toggleAddDialog] = useToggler()
  const [selectedItems, setSelectedItems] = useState(emptyArr)

  const deleteEnabled = !!handleRemove
  const editEnabled = EditDialog || editUrl
  const addEnabled = AddDialog || addUrl || addButtonConfigs

  const validAddButtonConfigs = addButtonConfigs
    ? addButtonConfigs.filter((config) => (config.cond ? config.cond() : true))
    : []

  const deleteConfirmText = useMemo(() => {
    if (isNilOrEmpty(selectedItems)) {
      return
    }
    const selectedNames = pluck(nameProp, selectedItems).join(', ')
    return `This will permanently delete the following: ${selectedNames}`
  }, [selectedItems])

  const handleDelete = (selected) => {
    setSelectedItems(selected)
    toggleConfirmDialog()
    // Stash the promise resolver so it can used to resolve later on in
    // response to user interaction (delete confirmation).
    return new Promise((resolve) => {
      deletePromise.current = resolve
    })
  }

  const handleDeleteConfirm = useCallback(async () => {
    toggleConfirmDialog()
    await Promise.all(selectedItems.map(handleRemove))
    await deletePromise.current()
    reload()
  }, [selectedItems, handleRemove])

  const handleAdd = () => {
    if (addUrl) {
      history.push(addUrl)
    } else if (AddDialog) {
      toggleAddDialog()
      reload()
    }
  }

  const handleEdit = (selected = emptyArr) => {
    if (editUrl) {
      const [selectedRow = emptyObj] = selected
      const selectedId = path(uniqueIdentifierPath, selectedRow)
      if (!selectedId) {
        console.error(
          `Unable to redirect to edit page, the current id (${uniqueIdentifier}) is not defined for the selected items`,
          selected,
        )
        return
      }
      const urlResult =
        typeof editUrl === 'function'
          ? editUrl(selectedRow, selectedId)
          : pathJoin(editUrl, selectedId)
      history.push(urlResult)
    } else if (EditDialog) {
      setSelectedItems(selected)
      toggleEditDialog()
      reload()
    }
  }

  const handleClose = (toggleDialog) => () => {
    toggleDialog()
    reload()
  }

  return (
    <>
      {AddDialog && showingAddDialog && <AddDialog onClose={handleClose(toggleAddDialog)} />}
      {EditDialog && showingEditDialog && (
        <EditDialog rows={selectedItems} onClose={handleClose(toggleEditDialog)} />
      )}
      {DeleteDialog && showingConfirmDialog && (
        <DeleteDialog onClose={toggleConfirmDialog} rows={selectedItems} />
      )}
      {!DeleteDialog && handleRemove && showingConfirmDialog && (
        <ConfirmationDialog
          open={showingConfirmDialog}
          text={deleteConfirmText}
          onCancel={toggleConfirmDialog}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {addEnabled && (
        <PageContainerHeader>
          {addButtonConfigs ? (
            // If addButtonConfigs supplied, override standard method
            <>
              {validAddButtonConfigs && validAddButtonConfigs.length && (
                <PageContainerHeader>
                  {validAddButtonConfigs.length === 1 ? (
                    <CreateButton
                      onClick={() => {
                        history.push(validAddButtonConfigs[0].link)
                      }}
                    >
                      {validAddButtonConfigs[0].label}
                    </CreateButton>
                  ) : (
                    <DropdownButton links={validAddButtonConfigs} addText={addText} />
                  )}
                </PageContainerHeader>
              )}
            </>
          ) : (
            <>
              {AddButton ? (
                <AddButton onClick={handleAdd} />
              ) : (
                <CreateButton onClick={handleAdd}>{addText}</CreateButton>
              )}
            </>
          )}
        </PageContainerHeader>
      )}
      {children({
        onDelete: deleteEnabled ? handleDelete : null,
        onAdd: addEnabled ? handleAdd : null,
        onEdit: editEnabled ? handleEdit : null,
        deleting,
      })}
    </>
  )
}

CRUDListContainer.propTypes = {
  addText: PropTypes.string,
  nameProp: PropTypes.string,
  AddDialog: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  EditDialog: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  addUrl: PropTypes.string,
  editUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  /**
   * Handler that is responsible for deleting the entity.
   * It is passed the selected rows
   */
  deleteFn: PropTypes.func,

  /*
    Some objects have a unique identifier other than 'id'
    For example sshKeys have unique identifier of 'name' and the APIs
    rely on using the name as part of the URI. Specify the unique identifier
    in props if it is different from 'id'

    For more complicated scenarios, you can pass a funciton that receives the row data and returns the uid.
    It has the following type signature:
      uniqueIdentifier :: RowData -> String
  */
  uniqueIdentifier: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}

CRUDListContainer.defaultProps = {
  addText: 'Add',
  nameProp: 'name',
  uniqueIdentifier: defaultUniqueIdentifier,
}

export default CRUDListContainer

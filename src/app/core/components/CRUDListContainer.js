import { isNilOrEmpty, emptyArr, emptyObj } from 'app/utils/fp'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback, useRef } from 'react'
import ConfirmationDialog from './ConfirmationDialog'
import useToggler from 'core/hooks/useToggler'
import { defaultUniqueIdentifier } from 'app/constants'
import { pluck, path } from 'ramda'
import useReactRouter from 'use-react-router'
import { pathJoin } from 'utils/misc'

const CRUDListContainer = ({ children, nameProp, AddDialog, EditDialog, addUrl, editUrl, onRemove, uniqueIdentifier }) => {
  const uniqueIdentifierPath = uniqueIdentifier.split('.')
  const { history } = useReactRouter()
  const deletePromise = useRef()
  const [showingConfirmDialog, toggleConfirmDialog] = useToggler()
  const [showingEditDialog, toggleEditDialog] = useToggler()
  const [showingAddDialog, toggleAddDialog] = useToggler()
  const [selectedItems, setSelectedItems] = useState(null)

  const deleteEnabled = !!onRemove
  const editEnabled = EditDialog || editUrl
  const addEnabled = AddDialog || addUrl

  const deleteConfirmText = useMemo(() => {
    if (isNilOrEmpty(selectedItems)) {
      return
    }
    const selectedNames = pluck(nameProp, selectedItems).join(', ')
    return `This will permanently delete the following: ${selectedNames}`
  }, [selectedItems])

  const handleDelete = selected => {
    setSelectedItems(selected)
    toggleConfirmDialog()
    // Stash the promise resolver so it can used to resolve later on in
    // response to user interaction (delete confirmation).
    return new Promise(resolve => { deletePromise.current = resolve })
  }

  const handleDeleteConfirm = useCallback(async () => {
    toggleConfirmDialog()
    await Promise.all(selectedItems.map(onRemove))
    deletePromise.current()
  }, [selectedItems, onRemove])

  const handleAdd = () => {
    if (addUrl) {
      history.push(addUrl)
    } else if (AddDialog) {
      toggleAddDialog()
    }
  }

  const handleEdit = (selected = emptyArr) => {
    if (editUrl) {
      const [selectedRow = emptyObj] = selected
      const selectedId = path(uniqueIdentifierPath, selectedRow)
      if (!selectedId) {
        console.error(`Unable to redirect to edit page, the current id (${uniqueIdentifier}) is not defined for the selected items`, selected)
        return
      }
      history.push(pathJoin(editUrl, selectedId))
    } else if (EditDialog) {
      setSelectedItems(selected)
      toggleEditDialog()
    }
  }

  return <>
    {AddDialog && <AddDialog
      open={showingAddDialog}
      onClose={toggleAddDialog}
    />}
    {EditDialog && <EditDialog
      rows={selectedItems}
      open={showingEditDialog}
      onClose={toggleEditDialog}
    />}
    {onRemove && <ConfirmationDialog
      open={showingConfirmDialog}
      text={deleteConfirmText}
      onCancel={toggleConfirmDialog}
      onConfirm={handleDeleteConfirm}
    />}
    {children({
      onDelete: deleteEnabled ? handleDelete : null,
      onAdd: addEnabled ? handleAdd : null,
      onEdit: editEnabled ? handleEdit : null,
    })}
  </>
}

CRUDListContainer.propTypes = {
  nameProp: PropTypes.string,
  AddDialog: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  EditDialog: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  addUrl: PropTypes.string,
  editUrl: PropTypes.string,

  /**
   * Handler that is responsible for deleting the entity.
   * It is passed the selected rows
   */
  onRemove: PropTypes.func,

  /*
    Some objects have a unique identifier other than 'id'
    For example sshKeys have unique identifier of 'name' and the APIs
    rely on using the name as part of the URI. Specify the unique identifier
    in props if it is different from 'id'

    For more complicated scenarios, you can pass a funciton that receives the row data and returns the uid.
    It has the following type signature:
      uniqueIdentifier :: RowData -> String
  */
  uniqueIdentifier: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]),
}

CRUDListContainer.defaultProps = {
  nameProp: 'name',
  uniqueIdentifier: defaultUniqueIdentifier,
}

export default CRUDListContainer

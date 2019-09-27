import React, { Fragment, useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import useReactRouter from 'use-react-router'
import { makeStyles, createStyles } from '@material-ui/styles'
import Box from '@material-ui/core/Box'
import CreateButton from 'core/components/buttons/CreateButton'

const useStyles = makeStyles(theme => createStyles({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}))

const TitleAndAddButton = ({ title, addUrl, addText, renderAddDialog, reload }) => {
  const { history } = useReactRouter()
  const classes = useStyles()
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const handleAddDialogClose = useCallback(() => {
    setAddDialogOpen(false)
    reload()
  }, [reload])

  const addButton = useMemo(() => (
    <CreateButton onClick={() => renderAddDialog ? setAddDialogOpen(true) : history.push(addUrl)}>
      {addText}
    </CreateButton>
  ), [history])

  const isTitleOrButtonVisible = addUrl || title || !!renderAddDialog
  const isAddDialogOpen = !!renderAddDialog && addDialogOpen

  return (
    <Fragment>
      {isTitleOrButtonVisible &&
        <Box className={classes.container}>
          <h2>{title}</h2>
          {!!addUrl && addButton}
        </Box>
      }
      {isAddDialogOpen && renderAddDialog(handleAddDialogClose)}
    </Fragment>
  )
}

TitleAndAddButton.propTypes = {
  title: PropTypes.string,
  addUrl: PropTypes.string,
  addText: PropTypes.string,
  renderAddDialog: PropTypes.func,
  reload: PropTypes.func,
}

export default TitleAndAddButton

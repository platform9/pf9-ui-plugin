import { withStyles } from '@material-ui/core/styles'
import DeleteIcon from '@material-ui/icons/Delete'
import DragHandleIcon from '@material-ui/icons/DragHandle'
import EditIcon from '@material-ui/icons/Edit'
import PropTypes from 'prop-types'
import { compose } from 'ramda'
import React from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import uuid from 'uuid'

const styles = theme => ({
  cardContainer: {
    position: 'relative',
    minWidth: 180,
    minHeight: 50,
    marginBottom: theme.spacing.unit,
    padding: '0.5rem 1rem',
    backgroundColor: 'white'
  },
  originCardOverlay: {
    position: 'absolute',
    cursor: 'move',
    opacity: 0.2,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10000
  },
  icon: {
    margin: 0,
    fontSize: 14
  },
  handlers: {
    position: 'absolute',
    display: 'flex',
    width: theme.spacing.unit * 5,
    height: '100%',
    flexFlow: 'row-reverse wrap',
    right: theme.spacing.unit,
    top: theme.spacing.unit,
    justifyContent: 'space-between',
  },
  dragHandle: {
    cursor: 'move',
  },
  editButton: {
    cursor: 'pointer'
  },
  removeButton: {
    cursor: 'pointer'
  },
})

const cardSource = {
  beginDrag (props) {
    return {
      id: props.id,
      originalIndex: props.getCardIndex(props.id)
    }
  },

  endDrag (props, monitor) {
    const { id: droppedId, originalIndex } = monitor.getItem()
    const didDrop = monitor.didDrop()

    if (!didDrop) {
      props.onCardMove(droppedId, originalIndex)
    }
  }
}

const cardTarget = {
  canDrop () {
    return false
  },

  hover (props, monitor) {
    const { id: draggedId } = monitor.getItem()
    const { id: overId } = props

    if (draggedId !== overId) {
      props.onCardMove(draggedId, props.getCardIndex(overId))
    }
  }
}

const DraggableCard = compose(
  withStyles(styles),
  DropTarget('card', cardTarget, connect => ({
    connectDropTarget: connect.dropTarget()
  })),
  DragSource('card', cardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }))
)(
  ({
    children,
    classes,
    isDragging,
    onCardRemove,
    onCardEdit,
    connectDragSource,
    connectDropTarget,
    connectDragPreview,
  }) =>
    connectDropTarget(
      connectDragPreview(
        <div
          className={classes.cardContainer}
          style={{ opacity: isDragging ? 0 : 1 }}
        >
          <div className={classes.handlers}>
            {connectDragSource(
              <div className={classes.dragHandle}>
                <DragHandleIcon className={classes.icon} />
              </div>
            )}
            {onCardEdit && (
              <div onClick={onCardEdit} className={classes.editButton}>
                <EditIcon className={classes.icon} />
              </div>
            )}
            {onCardRemove && (
              <div onClick={onCardRemove} className={classes.removeButton}>
                <DeleteIcon className={classes.icon} />
              </div>
            )}
          </div>
          {children}
        </div>
      )
    )
)

const originCardSource = {
  beginDrag (props) {
    return {
      id: uuid.v4(),
      name: props.name
    }
  },
  endDrag (props, monitor) {
    const { id: droppedId, originalIndex } = monitor.getItem()
    const didDrop = monitor.didDrop()

    if (!didDrop) {
      props.onCardRemove(droppedId, originalIndex)
    }
  }
}
export const OriginDraggableCard = compose(
  withStyles(styles),
  DragSource('card', originCardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))
)(
  ({
    children,
    classes,
    isDragging,
    connectDragSource,
  }) =>
    connectDragSource(
      <div
        className={classes.cardContainer}
        style={{ opacity: isDragging ? 0 : 1 }}
      >
        <div className={classes.originCardOverlay} />
        {children}
      </div>
    )
)

export default DraggableCard

OriginDraggableCard.propTypes = {
  text: PropTypes.string,
  onCardMove: PropTypes.func,
  onCardRemove: PropTypes.func
}

DraggableCard.propTypes = {
  id: PropTypes.string,
  text: PropTypes.string,
  getCardIndex: PropTypes.func,
  onCardMove: PropTypes.func,
  onCardRemove: PropTypes.func
}

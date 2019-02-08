import { withStyles } from '@material-ui/core/styles'
import DraggableCard from 'app/plugins/hackathon/components/formBuilder/DraggableCard'
import { compose } from 'ramda'
import React from 'react'
import { DropTarget } from 'react-dnd'

const styles = theme => ({
  root: {
    border: '1px solid #000',
    minHeight: 400
  },
  inputPlaceholder: {
    cursor: 'move',
    position: 'relative',
    minWidth: 200,
    height: 50,
    marginBottom: theme.spacing.unit * 2,
    border: '1px dashed gray',
    padding: '0.5rem 1rem',
    backgroundColor: 'white'
  }
})

class DropTargetForm extends React.Component {
  getInputIndex = id => this.props.inputs.findIndex(input => input.id === id)

  renderInput = inputSpec => {
    if (!inputSpec.Input) {
      return <div className={this.props.classes.inputPlaceholder} />
    }
    const { id, propValues = {}, Input } = inputSpec
    return (
      <DraggableCard
        key={id}
        id={id}
        getCardIndex={this.getInputIndex}
        onCardMove={this.props.onInputMove}
        onCardEdit={this.props.onInputEdit(id)}
        onCardRemove={this.props.onInputRemove(id)}
      >
        <Input {...propValues} />
      </DraggableCard>
    )
  }

  render () {
    const { canDrop, isOver, connectDropTarget, inputs, classes } = this.props
    const isActive = canDrop && isOver
    return connectDropTarget(
      <div className={classes.root}>
        {inputs.length
          ? inputs.map(this.renderInput)
          : isActive
            ? 'Release to drop'
            : 'Drag an input here'}
      </div>
    )
  }
}

const boxTarget = {
  drop (props, monitor) {
    const isActive = monitor.canDrop() && monitor.isOver()
    const currItem = monitor.getItem()
    if (isActive && currItem.name) {
      props.onInputAdd(currItem.id, currItem.name)
    }
  }
}

export default compose(
  withStyles(styles),
  DropTarget('card', boxTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    newInput: monitor.getDropResult(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  }))
)(DropTargetForm)

import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { OriginDraggableCard } from 'app/plugins/hackathon/components/formBuilder/DraggableCard'
import React from 'react'

const styles = theme => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap'
  }
})

class FormInputsPalette extends React.Component {
  renderInput = ({ id, name, editableProps, Input }, idx) => {
    return (
      <OriginDraggableCard
        key={name}
        name={name}
        onCardMove={this.props.onInputMove}
        onCardRemove={this.props.onInputRemove}
      >
        <Typography variant="caption">{name}</Typography>
        <Input />
      </OriginDraggableCard>
    )
  }

  render () {
    const { classes, inputs } = this.props
    return (
      <div className={classes.root}>
        <Typography variant="h6">Input palette</Typography>
        {inputs.map(this.renderInput)}
      </div>
    )
  }
}

export default withStyles(styles)(FormInputsPalette)

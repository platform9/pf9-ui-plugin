import { Checkbox as BaseCheckbox, FormControlLabel, Grid, TextField } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import DropTargetForm from 'app/plugins/hackathon/components/formBuilder/DropTargetForm'
import FormInputsPalette from 'app/plugins/hackathon/components/formBuilder/FormInputsPalette'
import FormPropsInspector from 'app/plugins/hackathon/components/formBuilder/FormPropsInspector'
import { withAppContext } from 'core/AppContext'
import Picklist from 'core/components/Picklist'
import PropTypes from 'prop-types'
import { append, compose, insert, pipe, update } from 'ramda'
import React from 'react'
import { except } from 'utils/fp'

const styles = theme => ({})

const paletteInputs = [
  {
    name: 'TextField',
    editableProps: {
      id: PropTypes.string,
      label: PropTypes.string,
      onChange: PropTypes.func,
      onClick: PropTypes.func,
      onLoad: PropTypes.func
    },
    Input: props => <TextField value={''} {...props} />
  },
  {
    name: 'Picklist',
    editableProps: {
      id: PropTypes.string,
      label: PropTypes.string,
      onChange: PropTypes.func,
      onClick: PropTypes.func,
      onLoad: PropTypes.func
    },
    Input: props => (
      <Picklist name={''} label={''} value={''} options={[]} {...props} />
    )
  },
  {
    name: 'Checkbox',
    editableProps: {
      id: PropTypes.string,
      label: PropTypes.string,
      onChange: PropTypes.func,
      onClick: PropTypes.func,
      onLoad: PropTypes.func
    },
    Input: ({ id, label, onChange, onClick, ...restProps }) => (
      <FormControlLabel
        label={label}
        control={<BaseCheckbox checked={false} {...restProps} />}
      />
    )
  },
  {
    name: 'Button',
    editableProps: {
      text: PropTypes.string,
      onClick: PropTypes.func
    },
    Input: ({ text = 'Button', onClick }) => (
      <button onClick={onClick} type="submit">
        {text}
      </button>
    )
  }
]

class FormBuilder extends React.Component {
  state = {
    inputs: [],
    currentInput: {}
  }

  handleInputEdit = id => () => {
    this.setState({
      currentInput: this.state.inputs.find(input => input.id === id)
    })
  }

  handleInputAdd = (id, name) => {
    this.setState(prevState => {
      const { inputs } = prevState
      const draggedItem = inputs.find(input => input.id === id)
      const paletteItem = paletteInputs.find(input => input.name === name)
      if (!draggedItem) {
        // Append the new item
        return {
          inputs: append({ id, ...paletteItem }, prevState.inputs)
        }
      }
      // Update the existing placeholder
      return {
        inputs: update(
          inputs.findIndex(input => input.id === id),
          { id, ...paletteItem },
          prevState.inputs
        )
      }
    })
  }

  handleInputMove = (id, atIndex) => {
    this.setState(prevState => {
      const { inputs } = prevState
      const draggedItem = inputs.find(input => input.id === id)

      if (!draggedItem) {
        // New item
        return {
          inputs: insert(atIndex, { id })(prevState.inputs)
        }
      }
      // Move item
      return {
        inputs: pipe(
          except(draggedItem),
          insert(atIndex, draggedItem)
        )(prevState.inputs)
      }
    })
  }

  handleInputRemove = id => () => {
    this.setState(prevState => {
      const { inputs } = prevState
      const draggedItem = inputs.find(input => input.id === id)
      return {
        currentInput: {},
        inputs: except(draggedItem, inputs)
      }
    })
  }

  handlePropChanges = (key, value) => {
    this.setState(prevState => {
      const { currentInput: selectedInput } = prevState
      const currentInput = {
        ...selectedInput,
        propValues: {
          ...selectedInput.propValues,
          [key]: value
        }
      }
      const idx = prevState.inputs.indexOf(selectedInput)
      return {
        currentInput,
        inputs: update(idx, currentInput, prevState.inputs)
      }
    })
  }

  render () {
    const { inputs, currentInput } = this.state
    const { classes } = this.props

    return (
      <div>
        <h1>Form Builder</h1>
        <Grid container spacing={8}>
          <Grid item xs={4}>
            <FormInputsPalette
              inputs={paletteInputs}
              onInputRemove={this.handleInputRemove}
              onInputMove={this.handleInputMove}
            />
          </Grid>
          <Grid item xs={5} className={classes.canvasWrapper}>
            <DropTargetForm
              inputs={inputs}
              onInputAdd={this.handleInputAdd}
              onInputEdit={this.handleInputEdit}
              onInputMove={this.handleInputMove}
              onInputRemove={this.handleInputRemove}
            />
          </Grid>
          <Grid item xs={3}>
            <FormPropsInspector
              inputProps={currentInput.editableProps}
              propValues={currentInput.propValues}
              onPropValueChange={this.handlePropChanges}
            />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default compose(
  withStyles(styles),
  withAppContext
)(FormBuilder)

import React from 'react'
import FormBuilder from './FormBuilder'
import NodeEditor from './NodeEditor'

class Demo extends React.Component {
  state = {
    selectedWorkflow: null,
    workflows: [
      { name: 'blank', description: 'this does nothing yet', nodes: [], wires: [] },
    ]
  }

  handleSaveWorkflow = workflow => {
    // 1. Save the workflow from the NodeEditor back into `state.workflows`
  }

  handleCreateWorkflow = () => {
    // 1. Create an empty workflow
    // 2. Add it to the workflows
    // 3. Set it to be active in the NodeEditor
  }

  render () {
    const { selectedWorkflow, workflows } = this.state
    const workflow = workflows.find(wf => wf.id === selectedWorkflow)

    return (
      <div>
        <h1>Demo</h1>

        <h6>TODO: workflow browser / selector</h6>
        <h6>TODO: workflow save button</h6>
        <h6>TODO: workflow delete button</h6>

        <NodeEditor
          workflow={workflow}
          onSaveWorkflow={this.handleSaveWorkflow}
        />

        <FormBuilder />
      </div>
    )
  }
}

export default Demo

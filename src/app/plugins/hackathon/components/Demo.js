import React from 'react'
import FormBuilder from './formBuilder/FormBuilder'
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

    const picklistStructure = [{ id: 'fieldName', label: 'display text for option' }]

    return (
      <div>
        <h1>Demo</h1>

        <h2>The Task</h2>
        <p>
          We want to attach a node to a Kubernetes cluster.  To do this we
          need to populate a picklist that lets us choose from the list
          of eligible nodes.
        </p>

        <p>The format for the Picklist looks like this</p>
        <pre>{JSON.stringify(picklistStructure, null, 4)}</pre>

        <p>
          Let's create a workflow to request the nodes from an API and then generate the necessary
          data structure for the Picklist.
        </p>

        <NodeEditor
          workflow={workflow}
          onSaveWorkflow={this.handleSaveWorkflow}
        />

        {false && <FormBuilder />}
      </div>
    )
  }
}

export default Demo

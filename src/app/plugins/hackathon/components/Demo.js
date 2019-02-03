import React from 'react'
import FormBuilder from './FormBuilder'
import NodeEditor from './NodeEditor'

class Demo extends React.Component {
  render () {
    return (
      <div>
        <h1>Demo</h1>
        <FormBuilder />
        <NodeEditor />
      </div>
    )
  }
}

export default Demo

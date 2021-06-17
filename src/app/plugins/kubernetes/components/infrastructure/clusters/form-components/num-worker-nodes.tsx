import TextField from 'core/components/validatedForm/TextField'
import React from 'react'

const NumWorkerNodesField = () => (
  <TextField
    id="numWorkers"
    type="number"
    label="Number of worker nodes"
    info="Number of worker nodes to deploy."
    required
  />
)

export default NumWorkerNodesField

import React from 'react'
import SimpleLink from 'core/components/SimpleLink'
import { k8sPrefix } from 'app/constants'

// TOOD: implement new UX for choosing the cluster type to create first.
// This is a placeholder for now.
const AddClusterPage = () => (
  <div>
    <h1>Choose a cluster type to create</h1>

    <ul>
      <li><SimpleLink src={`${k8sPrefix}/infrastructure/clusters/addAws`}>AWS</SimpleLink></li>
    </ul>
  </div>
)

export default AddClusterPage

import React, { forwardRef } from 'react'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

const kubernetesVersionPicklist = forwardRef(({ ...rest }, ref) => {
  const options = [{ label: 'v1.19', value: 'v1.19' }]
  return <Picklist {...rest} ref={ref} options={options} />
})

export default kubernetesVersionPicklist

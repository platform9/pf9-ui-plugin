import React, { forwardRef } from 'react'
import PicklistComponent from 'core/components/Picklist'
const Picklist: any = PicklistComponent
const VMKindOptions = [
  {
    label: 'VirtualMachine',
    value: 'VirtualMachine',
  },
  {
    label: 'VirtualMachineInstance',
    value: 'VirtualMachineInstance',
  },
]

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const VMPicklist = forwardRef<any, any>(({ onChange, value, ...rest }, ref) => {
  return <Picklist {...rest} ref={ref} onChange={onChange} options={VMKindOptions} value={value} />
})

export default VMPicklist

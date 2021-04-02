import React from 'react'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

const AppVersionPicklist = ({ options, ...rest }) => {
  return <Picklist {...rest} options={options} />
}

export default AppVersionPicklist

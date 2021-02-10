import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import AppVersionPicklist from './app-version-picklist'

export default function AppVersionPicklistField({ options, id = 'version', label = 'Version' }) {
  return (
    <PicklistField
      DropdownComponent={AppVersionPicklist}
      id={id}
      label={label}
      options={options}
      required
    />
  )
}

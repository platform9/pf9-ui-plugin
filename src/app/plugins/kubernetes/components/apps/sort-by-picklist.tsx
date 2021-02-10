import React, { useEffect } from 'react'
import PicklistDefault from 'core/components/Picklist'
import { head, propOr } from 'ramda'
import { allKey } from 'app/constants'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.
interface Props {
  options: any
  value: string
  onChange: (value: string) => void
  selectFirst?: boolean
}

const SortByPicklist = ({ options, value, onChange, selectFirst = true }: Props) => {
  // Select the first item as soon as data is loaded
  useEffect(() => {
    if (selectFirst) {
      onChange(propOr(allKey, 'value', head(options)))
    }
  }, [])

  return (
    <Picklist
      options={options}
      name="sort"
      label={'Sort'}
      onChange={onChange}
      showAll={false}
      value={value}
    />
  )
}

export default SortByPicklist

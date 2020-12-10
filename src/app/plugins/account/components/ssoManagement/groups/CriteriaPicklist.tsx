import React, { forwardRef, useEffect } from 'react'
import { propOr, head } from 'ramda'
import { allKey } from 'app/constants'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

export enum Criteria {
  Contains = 'any_one_of',
  DoesNotContain = 'not_any_of',
}

const options = [
  { label: 'Contains', value: Criteria.Contains },
  { label: 'Does not contain', value: Criteria.DoesNotContain },
]

interface Props {
  value: string
  onChange: (value: string) => void
  name?: string
  label?: string
  selectFirst?: boolean
  formField?: boolean
  required?: boolean
}

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const CriteriaPicklist: React.ComponentType<Props> = forwardRef<HTMLElement, Props>(
  (props, ref) => {
    const {
      onChange,
      value,
      name = 'criteria',
      label = 'Criteria',
      selectFirst = false,
      formField = false,
      required = false,
    } = props

    // Select the first item as soon as data is loaded
    useEffect(() => {
      if (selectFirst) {
        onChange(propOr(allKey, 'value', head(options)))
      }
    }, [])

    return (
      <Picklist
        name={name}
        label={label}
        value={value}
        ref={ref}
        onChange={onChange}
        options={options}
        showAll={false}
        formField={formField}
        className="validatedFormInput"
        required={required}
      />
    )
  },
)

export default CriteriaPicklist

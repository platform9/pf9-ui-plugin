import React, { forwardRef, useEffect } from 'react'
import { propOr, head } from 'ramda'
import { allKey } from 'app/constants'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

enum SsoProviders {
  Okta = 'okta',
  OneLogin = 'oneLogin',
  Google = 'google',
}

const options = [
  { label: 'Google', value: SsoProviders.Okta },
  { label: 'Okta', value: SsoProviders.OneLogin },
  { label: 'OneLogin', value: SsoProviders.Google },
]

interface Props {
  value: string
  onChange: (value: string) => void
  name?: string
  label?: string
  selectFirst?: boolean
  formField?: boolean
}

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const SsoProviderPicklist: React.ComponentType<Props> = forwardRef<HTMLElement, Props>(
  // ( name = 'severity', label = 'Severity', onChange, selectFirst = true, ...rest }, ref) => {
  (props, ref) => {
    const {
      onChange,
      value,
      name = 'ssoProvider',
      label = 'SSO Provider',
      selectFirst = false,
      formField = false,
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
      />
    )
  },
)

export default SsoProviderPicklist

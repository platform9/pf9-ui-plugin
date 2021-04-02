import React, { useMemo, useEffect } from 'react'
import { head, isEmpty, propOr } from 'ramda'
import PicklistDefault from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { allKey } from 'app/constants'
import { repositoryActions } from './repositories/actions'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

interface Props {
  value: any
  onChange: (value) => void
  selectFirst?: boolean
}

const RepositoryPicklist = ({ value, onChange, selectFirst = false }: Props) => {
  const [repos, reposLoading] = useDataLoader(repositoryActions.list)
  const options = useMemo(() => projectAs({ label: 'name', value: 'name' }, repos), [repos])

  // Select the first item as soon as data is loaded
  useEffect(() => {
    if (!isEmpty(options) && selectFirst) {
      onChange(propOr(allKey, 'value', head(options)))
    }
  }, [options])

  return (
    <Picklist
      onChange={onChange}
      loading={reposLoading}
      options={options}
      name="repositoryName"
      label="Repository"
      showAll={true}
      formField={false}
      value={value}
    />
  )
}

export default RepositoryPicklist

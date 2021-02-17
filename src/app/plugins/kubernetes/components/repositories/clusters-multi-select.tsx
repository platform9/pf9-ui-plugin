import React, { forwardRef, useEffect, useMemo } from 'react'
import { compose, projectAs } from 'utils/fp'
import withFormContext from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import MultiSelect from 'core/components/MultiSelect'
import { makeStyles } from '@material-ui/core/styles'
import Theme from 'core/themes/model'
import { clusterActions } from '../infrastructure/clusters/actions'
import { ValidatedFormProps } from 'core/components/validatedForm/model'

const useStyles = makeStyles((theme: Theme) => ({
  clustersMultiSelect: {
    border: '0px',
    padding: theme.spacing(0),
  },
}))

interface Props extends ValidatedFormProps {
  wizardContext: any
  onChange: any
  setNumClusterOptions?: (num: number) => void
}

const ClustersMultiSelect: React.ComponentType<Props> = forwardRef<HTMLElement, Props>(
  ({ wizardContext, onChange, setNumClusterOptions, ...rest }, ref) => {
    const classes = useStyles()
    const [clusters] = useDataLoader(clusterActions.list)
    const options = useMemo(() => projectAs({ value: 'uuid', label: 'name' }, clusters), [clusters])

    useEffect(() => {
      setNumClusterOptions(options.length)
    }, [options])

    return (
      <MultiSelect
        className={classes.clustersMultiSelect}
        id="clusters"
        options={options}
        values={wizardContext.clusters}
        onChange={onChange}
        maxHeight={500}
        showSelectDeselectAllOption={true}
        {...rest}
      ></MultiSelect>
    )
  },
)

export default compose(withFormContext)(ClustersMultiSelect) as React.FC<Props>

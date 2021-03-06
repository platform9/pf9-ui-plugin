import React, { forwardRef } from 'react'
import withFormContext from 'core/components/validatedForm/withFormContext'
import ListTable from 'core/components/listTable/ListTable'
import { ValidatedFormProps } from './model'

interface Props extends ValidatedFormProps {
  value?: string[]
  hasError?: boolean
  errorMessage?: string
  onChange?: any
  multiSelection?: boolean
  columns?: any
  data: any
  title?: string
  extraToolbarContent?: JSX.Element
  loading: boolean
}

// TODO: is forwardRef actually needed here?
const ListTableField: React.ComponentType<Props> = forwardRef<HTMLElement, Props>((props, ref) => {
  const {
    onChange,
    value = [],
    hasError,
    errorMessage,
    multiSelection = false,
    columns,
    data,
    title,
    extraToolbarContent,
    loading,
  } = props

  return (
    <>
      <ListTable
        ref={ref}
        onSelectedRowsChange={onChange}
        title={title}
        columns={columns}
        data={data}
        multiSelection={multiSelection}
        selectedRows={value}
        extraToolbarContent={extraToolbarContent}
        loading={loading}
      />
      {hasError && <div>{errorMessage}</div>}
    </>
  )
})

export default withFormContext(ListTableField) as React.FC<Props>

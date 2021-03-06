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
  checkboxCond?: any
  loading: boolean
  uniqueIdentifier?: string
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
    checkboxCond,
    loading,
    uniqueIdentifier,
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
        checkboxCond={checkboxCond}
        loading={loading}
        uniqueIdentifier={uniqueIdentifier}
      />
      {hasError && <div>{errorMessage}</div>}
    </>
  )
})

export default withFormContext(ListTableField) as React.FC<Props>

import React, { forwardRef } from 'react'
import withFormContext from 'core/components/validatedForm/withFormContext'
import ListTable from 'core/components/listTable/ListTable'
import { IValidatedForm } from './model'

interface Props extends IValidatedForm {
  value?: string[]
  hasError?: boolean
  errorMessage?: string
  onChange?: any
  multiSelection?: boolean
  columns?: any
  data: any
  title?: string
  loading: boolean
}

// TODO: is forwardRef actually needed here?
const ListTableField: React.ComponentType<Props> = forwardRef<HTMLElement, Props>(
  (props, ref) => {
    const {
      onChange,
      value = [],
      hasError,
      errorMessage,
      multiSelection = false,
      columns,
      data,
      title,
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
          loading={loading}
        />
        {hasError && <div>{errorMessage}</div>}
      </>
    )
  },
)

export default withFormContext(ListTableField) as React.FC<Props>

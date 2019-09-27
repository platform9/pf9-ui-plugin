import React from 'react'

const LoggingForm = ({ initialValues }) => {
  const isEdit = !!initialValues

  return (
    <div>
      <h3>Logging Form</h3>
      {isEdit && <p>{JSON.stringify(initialValues)}</p>}
    </div>
  )
}

export default LoggingForm

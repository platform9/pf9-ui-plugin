import React from 'react'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'

const Tags = ({ info = 'Add tag metadata to this cluster', blacklistedTags = [] }) => (
  <KeyValuesField id="tags" label="Tags" info={info} blacklistedTags={blacklistedTags} />
)

export default Tags

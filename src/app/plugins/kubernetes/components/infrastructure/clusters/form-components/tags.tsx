import React from 'react'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import CodeBlock from 'core/components/CodeBlock'

const TagsField = ({ info = 'Add tag metadata to this cluster', blacklistedTags = [] }) => (
  <KeyValuesField id="tags" label="Tags" info={info} blacklistedTags={blacklistedTags} />
)

export default TagsField

export const FormattedTags = ({ tags }) => {
  const elems = tags.map((tag) => <CodeBlock key={tag.key}>{tag.key}</CodeBlock>)
  return <>{!tags.length ? '-' : elems}</>
}

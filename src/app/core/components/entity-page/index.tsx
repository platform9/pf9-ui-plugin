import React from 'react'
import EntityHeaderCard, { EntityHeaderCardProps } from './entity-header-card'

function EntityPage<T>({
  title,
  backLink,
  actions,
  entity,
  children,
}: EntityHeaderCardProps<T> & { children?: any }) {
  return (
    <article>
      <EntityHeaderCard title={title} backLink={backLink} actions={actions} entity={entity} />
      {children}
    </article>
  )
}
export default EntityPage

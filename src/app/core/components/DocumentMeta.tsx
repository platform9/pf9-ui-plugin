import React from 'react'
import withSideEffect from 'react-side-effect'

interface IPropsList {
  title?: string
  titleTemplate?: string
  bodyId?: string
  bodyClasses?: string[]
}
type IProperty = keyof IPropsList

function getInnermostProperty<T extends IProperty = IProperty>(
  list: IPropsList[],
  property: T,
  defaultValue?: string,
): IPropsList[T] | string {
  const propsList: IPropsList[] = [].concat(list) // dont want to mutate the current list for future operations
  const innermostProplist = propsList.reverse().find((value) => value[property]) || {}
  return innermostProplist[property] || defaultValue
}

const getTitleFromPropsList = (propsList: IPropsList[]) => {
  const innermostTitle = getInnermostProperty(propsList, 'title')
  const innermostTemplate = getInnermostProperty(propsList, 'titleTemplate', 'Platform9 - %s')
  if (innermostTemplate && innermostTitle) {
    // eslint-disable-next-line
    return innermostTemplate.replace(/\%s/g, innermostTitle)
  }
  return innermostTitle
}
const getBodyIdFromPropsList = (propsList: IPropsList[]) =>
  getInnermostProperty(propsList, 'bodyId')

const getBodyClassesFromPropsList = (propsList: IPropsList[]) =>
  propsList
    .filter((props) => props.bodyClasses && Array.isArray(props.bodyClasses))
    .map((props) => props.bodyClasses)
    .reduce((classes, list) => classes.concat(list), [])

const updateTitle = (title = '') => {
  if (!title || title === document.title) {
    return
  }
  document.title = title || document.title
}
const updateBodyId = (id = '') => {
  if (!id || id === document.body.id) {
    return
  }
  document.body.setAttribute('id', id)
}
const updateBodyClasses = (classes: string[]) => {
  document.body.className = ''
  classes.forEach((cl) => {
    if (!cl || cl === '') {
      return
    }
    document.body.classList.add(cl)
  })
}

const reducePropsToState = (propsList: IPropsList[]) => ({
  title: getTitleFromPropsList(propsList),
  bodyId: getBodyIdFromPropsList(propsList),
  bodyClasses: getBodyClassesFromPropsList(propsList),
})
const handleClientStateChange = ({ title, bodyId, bodyClasses }: IPropsList) => {
  updateTitle(title)
  updateBodyId(bodyId)
  updateBodyClasses(bodyClasses)
}

export interface IDocumentMetaProps {
  title?: string
  titleTemplate?: string
  bodyId?: string
  bodyClasses?: any[]
}

class DocumentMeta extends React.Component<IDocumentMetaProps, {}> {
  render() {
    return null
  }
}

export default withSideEffect(
  reducePropsToState,
  handleClientStateChange,
)(DocumentMeta) as React.ComponentClass<IDocumentMetaProps>

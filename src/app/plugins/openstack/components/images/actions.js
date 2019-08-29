import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import { propEq } from 'ramda'
import createContextUpdater from 'core/helpers/createContextUpdater'

const { glance } = ApiClient.getInstance()

export const loadImages = createContextLoader('images', async () => {
  return glance.getImages()
})

export const updateImage = createContextUpdater('images', ({ id, ...data }, currentItems) => {
  const initialValue = currentItems.find(propEq('id', id))

  // Take out initialValue, pass in the id from other place
  // Translate to proper request body format
  const body = [
    {
      op: 'replace',
      path: '/name',
      value: data.name,
    },
    {
      op: 'replace',
      path: '/visibility',
      value: data.visibility,
    },
    {
      op: initialValue.pf9_description ? 'replace' : 'add',
      path: '/pf9_description',
      value: data.pf9_description,
    },
    {
      op: 'replace',
      path: '/owner',
      value: data.owner,
    },
    {
      op: 'replace',
      path: '/protected',
      value: data.protected,
    },
  ]

  // TODO: tags

  // This should return the response of the client
  return glance.updateImage(body, id)
})

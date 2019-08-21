import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'

export const loadImages = createContextLoader('images', async () => {
  const { glance } = ApiClient.getInstance()
  return glance.getImages()
})

// TODO: Use contextUpdater
export const updateImage = async (data, helpers) => {
  const { glance } = ApiClient.getInstance()
  const { context, dataKey, objId } = helpers
  const initialValue = context[dataKey].find(obj => obj.id === objId)

  // Take out initialValue, pass in the id from other place
  // Translate to proper request body format
  const body = []
  body.push({ op: 'replace', path: '/name', value: data.name })
  body.push({ op: 'replace', path: '/visibility', value: data.visibility })
  body.push({ op: initialValue.pf9_description ? 'replace' : 'add', path: '/pf9_description', value: data.pf9_description })
  body.push({ op: 'replace', path: '/owner', value: data.owner })
  body.push({ op: 'replace', path: '/protected', value: data.protected })

  // TODO: tags

  const updatedImage = await glance.updateImage(body, initialValue.id)

  // This should return the response of the client
  return updatedImage
}

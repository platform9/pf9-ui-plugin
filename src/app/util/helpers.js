import uuid from 'uuid'

export const addIdsToCollection = collection => collection.map(item => ({ ...item, id: item.id || uuid.v4() }))

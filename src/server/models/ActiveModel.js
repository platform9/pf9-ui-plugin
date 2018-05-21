// ActiveModel provides some basic functionality common to all models
// used in the simulator.  It is losely inspired by RoR's ActiveModel.
import uuid from 'uuid'

class ActiveModel {
  constructor (params = {}) {
    if (!this.constructor.getCollection) {
      throw new Error(`${this.constructor.name} must implement class method 'getCollection'`)
    }
    this.constructor.getCollection().push(this)
    this.id = params.id || uuid.v4()
    this.created_at = params.created_at || (new Date().toISOString())
    return this
  }

  destroy () {
    const col = this.constructor.getCollection()
    const id = this.id
    const idx = col.findIndex(x => x.id === id)
    if (idx > -1) {
      col.splice(idx, 1)
      return id
    }
  }

  asJson () {
    return {
      id: this.id
    }
  }

  toString = (pretty = true) => {
    return (pretty
      ? JSON.stringify(this.asJson(), null, 4)
      : JSON.stringify(this.asJson())
    )
  }
}

export default ActiveModel

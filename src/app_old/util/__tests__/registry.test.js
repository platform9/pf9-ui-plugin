import * as registry from '../registry'

describe('registry', () => {
  beforeEach(() => {
    registry.clearAll()
  })

  it('setItem', () => {
    registry.setItem('foo', 'bar')
    expect(registry.getItem('foo')).toEqual('bar')
  })

  it('getItem', () => {
    registry.setItem('foo', 'bar')
    expect(registry.getItem('foo')).toEqual('bar')
  })

  it('clearAll', () => {
    registry.setItem('foo', 'bar')
    expect(registry.getItem('foo')).toEqual('bar')
    registry.clearAll()
    expect(registry.getItem('foo')).toBeUndefined()
  })

  it('getInstance', () => {
    registry.setItem('foo', 123)
    registry.setItem('bar', 456)
    expect(registry.getInstance()).toEqual({ foo: 123, bar: 456 })
  })

  it('setupFromConfig', () => {
    const config = {
      host: 'http://somewhere.com',
      username: 'pf9@platform9.com',
      password: 'secret',
    }
    registry.setupFromConfig(config)
    const instance = registry.getInstance()
    expect(instance.username).toEqual(config.username)
    expect(instance.password).toEqual(config.password)
    expect(registry.getInstance()).toEqual(config)
  })
})

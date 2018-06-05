import React from 'react'
import pluginManager from '../pluginManager'

describe('pluginManager', () => {
  beforeEach(() => {
    pluginManager.clearAll()
  })

  test('registerRoutes', () => {
    pluginManager.registerRoutes(
      '',
      [
        { name: 'Dashboard', link: { path: '/', exact: true }, component: <h1>Dashboard</h1> },
        { name: 'Login', link: { path: '/login' }, component: <h1>Login</h1> },
      ]
    )
    const routes = pluginManager.getRoutes()
    expect(routes.length).toBe(2)

    expect(routes[0].name).toBe('Dashboard')
    expect(routes[1].name).toBe('Login')
    expect(routes[1].link.path).toBe('/login')
  })

  test('registerNavItems', () => {
    pluginManager.registerNavItems(
      '',
      [
        { name: 'Dashboard', link: { path: '/' } },
        { name: 'Tenants', link: { path: '/tenants' } },
      ]
    )
    const navItems = pluginManager.getNavItems()
    expect(navItems.length).toBe(2)
    expect(navItems[0].name).toBe('Dashboard')
    expect(navItems[1].name).toBe('Tenants')
    expect(navItems[1].link.path).toBe('/tenants')
  })

  test('clearAll', () => {
    pluginManager.registerRoutes(
      '',
      [
        { name: 'Dashboard', link: { path: '/', exact: true }, component: <h1>Dashboard</h1> },
        { name: 'Login', link: { path: '/login' }, component: <h1>Login</h1> },
      ]
    )
    pluginManager.registerNavItems(
      '',
      [
        { name: 'Dashboard', link: { path: '/' } },
        { name: 'Tenants', link: { path: '/tenants' } },
      ]
    )
    expect(pluginManager.getNavItems().length).toEqual(2)
    expect(pluginManager.getRoutes().length).toEqual(2)
    pluginManager.clearAll()
    expect(pluginManager.getNavItems().length).toEqual(0)
    expect(pluginManager.getRoutes().length).toEqual(0)
  })

  test('getOptions', () => {
    pluginManager.clearAll()
    pluginManager.setOption('customPluginValue', 'foo')
    expect(pluginManager.getOptions()).toMatchObject({ customPluginValue: 'foo' })
  })

  test('getOption', () => {
    pluginManager.clearAll()
    pluginManager.setOption('customPluginValue', 'foo')
    expect(pluginManager.getOption('customPluginValue')).toEqual('foo')
  })
})

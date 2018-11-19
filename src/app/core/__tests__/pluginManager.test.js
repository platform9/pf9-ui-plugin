import React from 'react'
import pluginManager from '../pluginManager'

const plugin = pluginManager.registerPlugin('testPluginId', 'Test Plugin', '')

describe('pluginManager', () => {
  beforeEach(() => {
    plugin.clearAll()
  })

  test('registerRoutes', () => {
    plugin.registerRoutes(
      [
        { name: 'Dashboard', link: { path: '/', exact: true }, component: <h1>Dashboard</h1> },
        { name: 'Login', link: { path: '/login' }, component: <h1>Login</h1> },
      ]
    )
    const routes = plugin.getRoutes()
    expect(routes.length).toBe(2)

    expect(routes[0].name).toBe('Dashboard')
    expect(routes[1].name).toBe('Login')
    expect(routes[1].link.path).toBe('/login')
  })

  test('registerNavItems', () => {
    plugin.registerNavItems(
      [
        { name: 'Dashboard', link: { path: '/' } },
        { name: 'Tenants', link: { path: '/tenants' } },
      ]
    )
    const navItems = plugin.getNavItems()
    expect(navItems.length).toBe(2)
    expect(navItems[0].name).toBe('Dashboard')
    expect(navItems[1].name).toBe('Tenants')
    expect(navItems[1].link.path).toBe('/tenants')
  })

  test('clearAll', () => {
    plugin.registerRoutes(
      [
        { name: 'Dashboard', link: { path: '/', exact: true }, component: <h1>Dashboard</h1> },
        { name: 'Login', link: { path: '/login' }, component: <h1>Login</h1> },
      ]
    )
    plugin.registerNavItems(
      [
        { name: 'Dashboard', link: { path: '/' } },
        { name: 'Tenants', link: { path: '/tenants' } },
      ]
    )
    expect(plugin.getNavItems().length).toEqual(2)
    expect(plugin.getRoutes().length).toEqual(2)
    plugin.clearAll()
    expect(plugin.getNavItems().length).toEqual(0)
    expect(plugin.getRoutes().length).toEqual(0)
  })

  test('getOptions', () => {
    plugin.clearAll()
    plugin.setOption('customPluginValue', 'foo')
    expect(plugin.getOptions()).toMatchObject({ customPluginValue: 'foo' })
  })

  test('getOption', () => {
    plugin.clearAll()
    plugin.setOption('customPluginValue', 'foo')
    expect(plugin.getOption('customPluginValue')).toEqual('foo')
  })
})

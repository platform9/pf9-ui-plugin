import { Route } from '../routes'

describe('Route', () => {
  test('url', () => {
    const route = new Route({ url: '/ui/kubernetes/infrastructure', name: 'Infrastructure' })
    expect(route.url).toBe('/ui/kubernetes/infrastructure')
    // expect(route.toString()).toBe('/ui/kubernetes/infrastructure')
    // expect(route.path()).toBe('/ui/kubernetes/infrastructure')
  })

  test('finding a registered route', () => {
    Route.register({
      url: '/ui/kubernetes/infrastructure#clusters',
      name: 'Infrastructure:Clusters:List'
    })
    const route = Route.find('/ui/kubernetes/infrastructure#clusters')
    expect(route.name).toEqual('Infrastructure:Clusters:List')
  })

  // test('path', () => {
  //   const route = new Route<{ id: string }>('/ui/kubernetes/infrastructure/clusters/:id/edit')
  //   expect(route.url).toBe('/ui/kubernetes/infrastructure/clusters/:id/edit')
  //   expect(route['path' as any]()).toBe('/ui/kubernetes/infrastructure/clusters/:id/edit')
  //   expect(route.path({ id: 'cluster-uuid' })).toBe('/ui/kubernetes/infrastructure/clusters/cluster-uuid/edit')
  //   expect(route.path({ id: 'cluster-uuid', name: 'My Awesome Cluster' })).toBe('/ui/kubernetes/infrastructure/clusters/cluster-uuid/edit?name=My+Awesome+Cluster')
  // })
  // test('hash', () => {
  //   const route = new Route<{ id: string }>('/ui/kubernetes/infrastructure/clusters/:id#nodeHealth')
  //   expect(route.path({ id: 'cluster-uuid' })).toBe('/ui/kubernetes/infrastructure/clusters/cluster-uuid#nodeHealth')
  //   expect(route.path({ id: 'cluster-uuid', name: 'My Awesome Cluster' })).toBe('/ui/kubernetes/infrastructure/clusters/cluster-uuid?name=My+Awesome+Cluster#nodeHealth')
  // })
})

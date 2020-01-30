import { Route } from '../routes'

describe('Route', () => {
  test('url', () => {
    const route = new Route('/ui/kubernetes/infrastructure#clusters')
    expect(route.url).toBe('/ui/kubernetes/infrastructure#clusters')
    expect(route.toString()).toBe('/ui/kubernetes/infrastructure#clusters')
    expect(route.path()).toBe('/ui/kubernetes/infrastructure#clusters')
  })

  test('path', () => {
    const route = new Route<{ id: string }>('/ui/kubernetes/infrastructure/clusters/:id/edit')
    expect(route.url).toBe('/ui/kubernetes/infrastructure#clusters')
    expect(route['path' as any]()).toBe('/ui/kubernetes/infrastructure/clusters/:id/edit')
    expect(route.path({ id: 'cluster-uuid' })).toBe('/ui/kubernetes/infrastructure/clusters/cluster-uuid/edit')
    expect(route.path({ id: 'cluster-uuid', name: 'My Awesome Cluster' })).toBe('/ui/kubernetes/infrastructure/clusters/cluster-uuid/edit?name=My+Awesome+Cluster')
  })
})

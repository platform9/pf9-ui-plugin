import { Route } from '../routes'

// const list = new Route(`/infrastructure#clusters`)
// console.log(list.path()) // good to go
// console.log(list.path({})) // good to go
// console.log(list.path({search: 'asdf'})) // good to go

// const edit = new Route<{ id: string }>(`/infrastructure/clusters/edit/:id`)
// console.log(edit.path()) // should error here. id is required
// console.log(edit.path({})) // should error here. id is required
// console.log(edit.path({ search: 'asdf' })) // should error here. id is required
// console.log(edit.path({ id: '1', search: 'asdf'})) // good to go

describe('Route class', () => {
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
    expect(route.path({ id: 'cluster-uuid', name: 'My Awesome Cluster' })).toBe('/ui/kubernetes/infrastructure/clusters/cluster-uuid/edit')
  })
})
